const Request = require('../models/Request');    
const DepartmentTask = require('../models/DepartmentTask');
const Certificate = require('../models/Certificate');
const fs = require('fs');
const path = require('path');
const { getDepartmentsForRequest } = require('../utils/departmentRouting');
const { predictComplaintTypeML } = require('../utils/mlComplaintClassifier');
const { predictDocumentTypeML } = require('../utils/mlDocumentClassifier');
const { generateCertificate } = require('../utils/pdfGenerator');
const RequestModel = require('../models/Request');
const complaintStages = RequestModel.complaintStages;
const documentStages = RequestModel.documentStages;
const { listOfficersByDepartment } = require('../data/officers');
const mongoose = require('mongoose');

function safeUpdatedBy(user) {
  const id = user?._id;
  if (!id) return undefined;
  return mongoose.Types.ObjectId.isValid(id) ? id : undefined;
}

function getStagesByCategory(category) {
  return category === 'complaint' ? complaintStages : documentStages;
}

function normalizeStageValue(value) {
  return String(value || '').trim();
}

function isComplaintFinalStageValue(value) {
  const v = normalizeStageValue(value);
  return v === 'Closed';
}

function isDocumentFinalStageValue(value) {
  const v = normalizeStageValue(value);
  return v === 'Available for Download' || v === 'Certificate Generated';
}

function isComplaintRequestCompleted(request) {
  if (request?.requestCategory !== 'complaint') return false;

  return (
    isComplaintFinalStageValue(request?.currentStage) ||
    isComplaintFinalStageValue(request?.status)
  );
}
function isDocumentRequestCompleted(request) {
  if (request?.requestCategory !== 'document') return false;

  return (
    isDocumentFinalStageValue(request?.currentStage) ||
    isDocumentFinalStageValue(request?.status)
  );
}

function isRequestCompleted(request) {
  return (
    isComplaintRequestCompleted(request) ||
    isDocumentRequestCompleted(request)
  );
}

function getCurrentStageIndex(request) {
  const stages = getStagesByCategory(request.requestCategory);
  const current = request.currentStage || request.status || stages[0];
  const idx = stages.indexOf(current);
  return idx >= 0 ? idx : 0;
}

function canMoveToStage(request, nextStage) {
  const stages = getStagesByCategory(request.requestCategory);
  const currentIndex = getCurrentStageIndex(request);
  const nextIndex = stages.indexOf(nextStage);

  if (nextIndex === -1) return false;
  if (nextIndex === currentIndex) return true;

  return nextIndex === currentIndex + 1;
}

function isFinalComplaintCompletion(request) {
  return isComplaintRequestCompleted(request);
}

function isFinalDocumentCompletion(request) {
  return isDocumentRequestCompleted(request);
}
/* =========================================================
   CHECKLIST HELPERS - KEPT, BUT NOT USED TO BLOCK STAGE MOVE
========================================================= */

function getComplaintChecklistConfig() {
  return {
    'Submitted': [
      'requestType',
      'location'
    ],
    'Under Review': [
      'area',
      'ward'
    ],
    'Inspection Scheduled': [
      'exactAddress',
      'landmark'
    ],
    'Work In Progress': [
      'description',
      'priority'
    ],
    'Resolved': [
      'imageUrl',
      'preferredInspectionTime'
    ],
    'Closed': [
      'contactNumber'
    ]
  };
}

function splitKeysAcrossStages(keys, stagesList) {
  const result = {};
  const safeStages = Array.isArray(stagesList) ? stagesList : [];

  safeStages.forEach((stage) => {
    result[stage] = [];
  });

  if (!keys.length || !safeStages.length) {
    return result;
  }

  keys.forEach((key, index) => {
    const stage = safeStages[index % safeStages.length];
    result[stage].push(key);
  });

  return result;
}

function getDocumentChecklistConfigByType(requestType, documentData = {}) {
  const allKeys = Object.keys(documentData || {}).filter(
    (key) => documentData[key] !== undefined && documentData[key] !== null && documentData[key] !== ''
  );

  const realStages = Array.isArray(documentStages) && documentStages.length
    ? documentStages
    : [
      'Application Submitted',
      'Document Verification',
      'Department Approval',
      'Certificate Generated',
      'Available for Download'
    ];

  const distributed = splitKeysAcrossStages(allKeys, realStages);

  const defaultMap = {};
  realStages.forEach((stage) => {
    defaultMap[stage] = distributed[stage] || [];
  });

  const byType = {
    'Birth Certificate': defaultMap,
    'Income Certificate': defaultMap,
    'Land Ownership Certificate': defaultMap,
    'Building Approval': defaultMap,
    'Business License': defaultMap,
    'New Water Connection': defaultMap,
    'Electricity Connection': defaultMap
  };

  return byType[requestType] || defaultMap;
}

function getRequestFieldValue(request, key) {
  if (!request) return '';

  const labelMap = {
    requestType: request.requestType || '',
    location: request.location || '',
    area: request.area || '',
    ward: request.ward || '',
    exactAddress: request.exactAddress || '',
    landmark: request.landmark || '',
    description: request.description || '',
    priority: request.priority || '',
    imageUrl: request.imageUrl || '',
    contactNumber: request.contactNumber || '',
    preferredInspectionTime: request.preferredInspectionTime || ''
  };

  if (Object.prototype.hasOwnProperty.call(labelMap, key)) {
    return labelMap[key];
  }

  if (request.documentData && Object.prototype.hasOwnProperty.call(request.documentData, key)) {
    return request.documentData[key];
  }

  return '';
}

function getReadableFieldLabel(key) {
  const labels = {
    requestType: 'Complaint Type',
    location: 'Location',
    area: 'Location / Area',
    ward: 'Ward',
    exactAddress: 'Exact Address',
    landmark: 'Nearest Landmark',
    description: 'Complaint Description',
    priority: 'Priority',
    imageUrl: 'Image',
    contactNumber: 'Citizen Contact Number',
    preferredInspectionTime: 'Preferred Inspection Time'
  };

  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

function getChecklistFieldKeysForStage(request, stage) {
  if (!request || !stage) return [];

  if (request.requestCategory === 'complaint') {
    const config = getComplaintChecklistConfig();
    return config[stage] || [];
  }

  const config = getDocumentChecklistConfigByType(request.requestType, request.documentData || {});
  return config[stage] || [];
}

function buildStageChecklist(request, stage, previousChecklist = []) {
  const fieldKeys = getChecklistFieldKeysForStage(request, stage);

  return fieldKeys.map((fieldKey) => {
    const previous = (previousChecklist || []).find((item) => item.fieldKey === fieldKey);

    return {
      fieldKey,
      fieldLabel: getReadableFieldLabel(fieldKey),
      fieldValue: getRequestFieldValue(request, fieldKey),
      checked: previous ? !!previous.checked : false,
      checkedAt: previous?.checkedAt || null
    };
  });
}

async function syncTaskChecklistFromRequest(task, request) {
  const stages = getStagesByCategory(request.requestCategory);
  const stage = task.stage || request.currentStage || stages[0];

  task.allowedStages = stages;
  task.currentStageIndex = Math.max(stages.indexOf(stage), 0);
  task.stageChecklist = buildStageChecklist(request, stage, task.stageChecklist || []);
  task.isStageChecklistCompleted =
    Array.isArray(task.stageChecklist) && task.stageChecklist.length > 0
      ? task.stageChecklist.every((item) => item.checked)
      : true;

  if (task.isStageChecklistCompleted) {
    task.lastChecklistCompletedStage = stage;
  }
}

function normalizeIncomingChecklist(stageChecklist) {
  if (!Array.isArray(stageChecklist)) return [];

  return stageChecklist.map((item) => ({
    fieldKey: String(item.fieldKey || '').trim(),
    checked: !!item.checked
  })).filter((item) => item.fieldKey);
}

function applyChecklistUpdateToTask(task, request, stageChecklistInput) {
  const normalizedInput = normalizeIncomingChecklist(stageChecklistInput);
  const currentStage = task.stage || request.currentStage || getStagesByCategory(request.requestCategory)[0];
  const freshChecklist = buildStageChecklist(request, currentStage, task.stageChecklist || []);

  const updatedChecklist = freshChecklist.map((item) => {
    const incoming = normalizedInput.find((entry) => entry.fieldKey === item.fieldKey);

    if (incoming) {
      return {
        ...item,
        checked: incoming.checked,
        checkedAt: incoming.checked ? new Date() : null
      };
    }

    return item;
  });

  task.stageChecklist = updatedChecklist;
  task.isStageChecklistCompleted =
    updatedChecklist.length > 0 ? updatedChecklist.every((item) => item.checked) : true;

  if (task.isStageChecklistCompleted) {
    task.lastChecklistCompletedStage = currentStage;
  }
}

async function finalizeIfAllDepartmentsDone(requestId, actorUser) {
  const request = await Request.findById(requestId).populate('userId', 'name email');
  if (!request) return null;

  const tasks = await DepartmentTask.find({ requestId: request._id });
  if (!tasks.length) return request;

  const anyRejected = tasks.some((t) => t.status === 'rejected');
  if (anyRejected) {
    if (request.status !== 'Rejected' || request.currentStage !== 'Rejected') {
      request.currentStage = 'Rejected';
      request.status = 'Rejected';
      request.timeline.push({
        stage: 'Rejected',
        note: 'One or more departments rejected the request',
        updatedBy: safeUpdatedBy(actorUser)
      });
      await request.save();
    }
    return request;
  }

  const allApproved = tasks.every((t) => String(t.status || '').trim().toLowerCase() === 'approved');

  if (!allApproved) {
    return request;
  }
  if (request.requestCategory === 'complaint') {

    const finalComplaintStage =
      request.currentStage === 'Closed'
        ? 'Closed'
        : (request.status === 'Closed' ? 'Closed' : null);
  
    if (finalComplaintStage) {
      if (
        request.currentStage !== finalComplaintStage ||
        request.status !== finalComplaintStage
      ) {
        request.currentStage = finalComplaintStage;
        request.status = finalComplaintStage;
  
        request.timeline.push({
          stage: finalComplaintStage,
          note: `Complaint marked as ${finalComplaintStage}`,
          updatedBy: safeUpdatedBy(actorUser)
        });
  
        await request.save();
      }
    }
  
    return request;
  }

  if (request.requestCategory === 'complaint') {

    const finalComplaintStage =
      request.currentStage === 'Closed'
        ? 'Closed'
        : (request.status === 'Closed' ? 'Closed' : null);
  
    if (finalComplaintStage) {
      if (
        request.currentStage !== finalComplaintStage ||
        request.status !== finalComplaintStage
      ) {
        request.currentStage = finalComplaintStage;
        request.status = finalComplaintStage;
  
        request.timeline.push({
          stage: finalComplaintStage,
          note: `Complaint marked as ${finalComplaintStage}`,
          updatedBy: safeUpdatedBy(actorUser)
        });
  
        await request.save();
      }
    }
  }

  return request;
}

async function pickLeastLoadedOfficerId(department) {
  const state = await buildDepartmentLoadState(department);
  const next = chooseNextOfficer(state);
  return next?.officerId || null;
}

async function buildDepartmentLoadState(department) {
  const members = listOfficersByDepartment(department);
  if (!members.length) {
    return { members: [], byOfficerId: {} };
  }

  const loadRows = await DepartmentTask.aggregate([
    {
      $match: {
        department,
        assignedOfficerId: { $ne: '' },
        archivedForOfficer: { $ne: true },
        status: { $ne: 'rejected' }
      }
    },
    {
      $lookup: {
        from: 'requests',
        localField: 'requestId',
        foreignField: '_id',
        as: 'requestDoc'
      }
    },
    {
      $unwind: {
        path: '$requestDoc',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        requestCategoryValue: '$requestDoc.requestCategory',
        requestStatusValue: '$requestDoc.status',
        requestCurrentStageValue: '$requestDoc.currentStage',
        taskStatusValue: '$status'
      }
    },
    {
      $match: {
        $expr: {
          $not: {
            $or: [
              {
                $and: [
                  { $eq: ['$requestCategoryValue', 'complaint'] },
                  {
                    $or: [
                      { $eq: ['$requestStatusValue', 'Closed'] },
                      { $eq: ['$requestCurrentStageValue', 'Closed'] },
                      { $eq: ['$requestStatusValue', 'Resolved'] },
                      { $eq: ['$requestCurrentStageValue', 'Resolved'] }
                    ]
                  },
                  { $eq: ['$taskStatusValue', 'approved'] }
                ]
              },
              {
                $and: [
                  { $eq: ['$requestCategoryValue', 'document'] },
                  {
                    $or: [
                      { $eq: ['$requestStatusValue', 'Available for Download'] },
                      { $eq: ['$requestCurrentStageValue', 'Available for Download'] },
                      { $eq: ['$requestStatusValue', 'Certificate Generated'] },
                      { $eq: ['$requestCurrentStageValue', 'Certificate Generated'] }
                    ]
                  },
                  { $eq: ['$taskStatusValue', 'approved'] }
                ]
              }
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: '$assignedOfficerId',
        count: { $sum: 1 }
      }
    }
  ]);

  const lastAssignedRows = await DepartmentTask.aggregate([
    {
      $match: {
        department,
        assignedOfficerId: { $ne: '' }
      }
    },
    {
      $group: {
        _id: '$assignedOfficerId',
        lastAssignedAt: { $max: '$createdAt' }
      }
    }
  ]);

  const byOfficerId = {};
  members.forEach((m, idx) => {
    byOfficerId[m.officerId] = {
      officerId: m.officerId,
      name: m.name,
      load: 0,
      lastAssignedAt: null,
      stableIndex: idx
    };
  });

  loadRows.forEach((row) => {
    if (byOfficerId[row._id]) {
      byOfficerId[row._id].load = row.count;
    }
  });

  lastAssignedRows.forEach((row) => {
    if (byOfficerId[row._id]) {
      byOfficerId[row._id].lastAssignedAt = row.lastAssignedAt || null;
    }
  });

  return { members, byOfficerId };
}

function chooseNextOfficer(state) {
  const values = Object.values(state.byOfficerId || {});
  if (!values.length) return null;

  const sorted = values.sort((a, b) => {
    if (a.load !== b.load) return a.load - b.load;

    const aTime = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : Number.NEGATIVE_INFINITY;
    const bTime = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : Number.NEGATIVE_INFINITY;

    if (aTime !== bTime) return aTime - bTime;

    return a.stableIndex - b.stableIndex;
  });

  return sorted[0];
}

function applyAssignmentToState(state, officerId) {
  const entry = state.byOfficerId?.[officerId];
  if (!entry) return;
  entry.load += 1;
  entry.lastAssignedAt = new Date();
}

async function createDepartmentTaskWithBalancedAssignee(requestId, department, stateByDepartment) {
  if (!stateByDepartment[department]) {
    stateByDepartment[department] = await buildDepartmentLoadState(department);
  }

  const state = stateByDepartment[department];
  const selected = chooseNextOfficer(state);
  const officerId = selected?.officerId || '';
  const member = officerId
    ? listOfficersByDepartment(department).find((o) => o.officerId === officerId)
    : null;

  const request = await Request.findById(requestId);
  const initialStages = getStagesByCategory(request?.requestCategory || 'complaint');
  const initialStage = request?.currentStage || initialStages[0];

  const task = new DepartmentTask({
    requestId,
    department,
    assignedOfficerId: officerId,
    assignedOfficerName: member?.name || '',
    stage: initialStage,
    allowedStages: initialStages,
    currentStageIndex: Math.max(initialStages.indexOf(initialStage), 0),
    stageChecklist: buildStageChecklist(request, initialStage, []),
    isStageChecklistCompleted: false,
    lastChecklistCompletedStage: ''
  });

  if (!task.stageChecklist.length) {
    task.isStageChecklistCompleted = true;
    task.lastChecklistCompletedStage = initialStage;
  }

  await task.save();

  if (officerId) {
    applyAssignmentToState(state, officerId);
  }
}

async function assignUnassignedTasksInDepartment(department) {
  const unassignedTasks = await DepartmentTask.find({
    department,
    assignedOfficerId: ''
  }).sort({ createdAt: 1 });

  if (!unassignedTasks.length) return;

  const state = await buildDepartmentLoadState(department);

  for (const task of unassignedTasks) {
    const selected = chooseNextOfficer(state);
    const officerId = selected?.officerId || null;
    if (!officerId) continue;

    const member = listOfficersByDepartment(department).find((o) => o.officerId === officerId);
    task.assignedOfficerId = officerId;
    task.assignedOfficerName = member?.name || '';
    task.updatedAt = new Date();
    await task.save();
    applyAssignmentToState(state, officerId);
  }
}

exports.createComplaint = async (req, res) => {
  try {
    const {
      requestType,
      location,
      area,
      ward,
      exactAddress,
      landmark,
      description,
      priority,
      contactNumber,
      preferredInspectionTime
    } = req.body;

    let predictedType = requestType;
    if (!predictedType && description) {
      predictedType = predictComplaintTypeML(description)?.predictedType || '';
    }

    const imageUrl = req.file ? `/uploads/complaints/${req.file.filename}` : '';
    const departments = getDepartmentsForRequest('complaint', predictedType);

    const request = new Request({
      requestType: predictedType,
      requestCategory: 'complaint',
      userId: req.user._id,
      status: 'Submitted',
      currentStage: 'Submitted',
      priority: priority || 'medium',
      location: location || '',
      area: area || '',
      ward: ward || '',
      exactAddress: exactAddress || '',
      landmark: landmark || '',
      contactNumber: contactNumber || '',
      preferredInspectionTime: preferredInspectionTime || '',
      description: description || '',
      imageUrl,
      assignedDepartments: departments,
      timeline: [{ stage: 'Submitted', note: 'Complaint submitted by citizen' }]
    });

    await request.save();

    const stateByDepartment = {};
    for (const dept of departments) {
      await createDepartmentTaskWithBalancedAssignee(request._id, dept, stateByDepartment);
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createDocumentRequest = async (req, res) => {
  try {
    const { requestType, documentData, priority } = req.body;
    const parsedData =
      typeof documentData === 'string'
        ? JSON.parse(documentData || '{}')
        : (documentData || {});

    let predictedType = requestType;
    if (!predictedType && parsedData?.purpose) {
      predictedType = predictDocumentTypeML(parsedData.purpose)?.predictedType || '';
    }

    const departments = getDepartmentsForRequest('document', predictedType);

    const request = new Request({
      requestType: predictedType,
      requestCategory: 'document',
      userId: req.user._id,
      status: 'Application Submitted',
      currentStage: 'Application Submitted',
      priority: priority || 'medium',
      documentData: parsedData,
      assignedDepartments: departments,
      timeline: [{ stage: 'Application Submitted', note: 'Application submitted by citizen' }]
    });

    await request.save();

    const stateByDepartment = {};
    for (const dept of departments) {
      await createDepartmentTaskWithBalancedAssignee(request._id, dept, stateByDepartment);
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = { userId: req.user._id };

    if (category) filter.requestCategory = category;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { requestId: new RegExp(search, 'i') },
        { requestType: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { category, status, priority, search, department } = req.query;
    const filter = {};

    if (category) filter.requestCategory = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (department) filter.assignedDepartments = department;

    if (search) {
      filter.$or = [
        { requestId: new RegExp(search, 'i') },
        { requestType: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const requests = await Request.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('userId', 'name email');
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    if (
      req.user.role === 'citizen' &&
      request.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const tasks = await DepartmentTask.find({ requestId: request._id }).populate(
      'assignedOfficer',
      'name email'
    );

    for (const task of tasks) {
      await syncTaskChecklistFromRequest(task, request);
      await task.save();
    }

    res.json({ request, departmentTasks: tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (request.requestCategory !== 'complaint') {
      return res.status(400).json({ message: 'Only complaints can be deleted.' });
    }

    if (request.status !== 'Submitted' && request.status !== 'Pending') {
      return res.status(400).json({
        message: 'Only Submitted or Pending complaints can be deleted.'
      });
    }

    await DepartmentTask.deleteMany({ requestId: request._id });
    await Certificate.deleteMany({ requestId: request._id });
    await Request.findByIdAndDelete(req.params.id);

    res.json({ message: 'Complaint deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found.' });

    request.officerComments.push({
      text,
      authorId: safeUpdatedBy(req.user),
      authorName: req.user.name
    });

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyDepartmentTasks = async (req, res) => {
  try {
    await assignUnassignedTasksInDepartment(req.user.department);

    const tasks = await DepartmentTask.find({
      department: req.user.department,
      assignedOfficerId: req.user.officerId
    })
      .populate('requestId')
      .populate('assignedOfficer', 'name email');

    const requestIds = [
      ...new Set(tasks.map((t) => t.requestId && t.requestId._id).filter(Boolean))
    ];

    const requests = await Request.find({ _id: { $in: requestIds } }).populate(
      'userId',
      'name email'
    );

    const byRequest = {};
    requests.forEach((r) => {
      byRequest[r._id.toString()] = r;
    });

    const result = [];
    for (const t of tasks) {
      const fullRequest = t.requestId ? byRequest[t.requestId._id.toString()] : null;

      if (fullRequest) {
        await syncTaskChecklistFromRequest(t, fullRequest);
        await t.save();
      }

      result.push({
        task: t,
        request: fullRequest
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.archiveDepartmentTask = async (req, res) => {
  try {
    const task = await DepartmentTask.findOne({
      _id: req.params.taskId,
      department: req.user.department,
      assignedOfficerId: req.user.officerId
    }).populate('requestId');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const request = task.requestId;
    if (!request) {
      return res.status(404).json({ message: 'Related request not found.' });
    }

    const isCompletedComplaint = isFinalComplaintCompletion(request);
    const isCompletedDocument = isFinalDocumentCompletion(request);

    if (!isCompletedComplaint && !isCompletedDocument) {
      return res.status(400).json({
        message: 'Only fully completed complaints or fully completed documents can be archived.'
      });
    }

    task.archivedForOfficer = true;
    task.updatedAt = new Date();
    await task.save();

    res.json({ message: 'Task archived successfully.', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unarchiveDepartmentTask = async (req, res) => {
  try {
    const task = await DepartmentTask.findOne({
      _id: req.params.taskId,
      department: req.user.department,
      assignedOfficerId: req.user.officerId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (!task.archivedForOfficer) {
      return res.status(400).json({ message: 'Task is not archived.' });
    }

    task.archivedForOfficer = false;
    task.updatedAt = new Date();
    await task.save();

    res.json({ message: 'Task unarchived successfully.', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDepartmentTask = async (req, res) => {
  try {
    const task = await DepartmentTask.findOne({
      _id: req.params.taskId,
      department: req.user.department,
      assignedOfficerId: req.user.officerId
    });

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const request = await Request.findById(task.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    await syncTaskChecklistFromRequest(task, request);

    const {
      stage,
      status,
      remarks,
      inspectionNotes,
      verificationResult,
      stageChecklist
    } = req.body;

    if (stageChecklist !== undefined) {
      applyChecklistUpdateToTask(task, request, stageChecklist);
    }

    if (stage) {
      const stages = getStagesByCategory(request.requestCategory);

      if (!stages.includes(stage)) {
        return res.status(400).json({ message: 'Invalid stage.' });
      }

      if (!canMoveToStage(request, stage)) {
        return res.status(400).json({
          message: 'Stage must move step by step only.'
        });
      }

      task.stage = stage;
      task.currentStageIndex = Math.max(stages.indexOf(stage), 0);
      task.allowedStages = stages;
      task.stageChecklist = buildStageChecklist(request, stage, task.stageChecklist || []);
      task.isStageChecklistCompleted =
        task.stageChecklist.length > 0
          ? task.stageChecklist.every((item) => item.checked)
          : true;

      if (task.isStageChecklistCompleted) {
        task.lastChecklistCompletedStage = stage;
      }
    }

    if (status) task.status = status;
    if (remarks !== undefined) task.remarks = remarks;
    if (inspectionNotes !== undefined) task.inspectionNotes = inspectionNotes;
    if (verificationResult !== undefined) task.verificationResult = verificationResult;

    if (req.user?.role === 'officer') {
      if (!task.assignedOfficerId && req.user.officerId) {
        task.assignedOfficerId = req.user.officerId;
      }
      if (!task.assignedOfficerName && req.user.name) {
        task.assignedOfficerName = req.user.name;
      }
    } else if (!task.assignedOfficer) {
      task.assignedOfficer = req.user._id;
    }

    if (status && (status === 'approved' || status === 'rejected')) {
      task.completedByOfficerId = req.user.officerId || String(req.user._id || '');
      task.completedAt = new Date();
    }

    task.updatedAt = new Date();
    await task.save();

    if (stage) {
      request.currentStage = stage;
      request.status = stage;
      request.timeline.push({
        stage,
        note: remarks || `Stage moved to ${stage}`,
        updatedBy: safeUpdatedBy(req.user)
      });
      await request.save();
    } else {
      if (
        isComplaintFinalStageValue(request.currentStage) ||
        isComplaintFinalStageValue(request.status)
      ) {
        request.currentStage = isComplaintFinalStageValue(request.currentStage)
          ? request.currentStage
          : 'Closed';
        request.status = isComplaintFinalStageValue(request.status)
          ? request.status
          : request.currentStage;
      }

      if (
        isDocumentFinalStageValue(request.currentStage) ||
        isDocumentFinalStageValue(request.status)
      ) {
        request.currentStage = isDocumentFinalStageValue(request.currentStage)
          ? request.currentStage
          : 'Available for Download';
        request.status = isDocumentFinalStageValue(request.status)
          ? request.status
          : request.currentStage;
      }

      await request.save();
    }

    await finalizeIfAllDepartmentsDone(task.requestId, req.user);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRequestStage = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    if (!request.assignedDepartments.includes(req.user.department)) {
      return res.status(403).json({ message: 'Not assigned to your department.' });
    }

    const myTask = await DepartmentTask.findOne({
      requestId: request._id,
      department: req.user.department,
      assignedOfficerId: req.user.officerId
    });

    if (!myTask) {
      return res.status(403).json({
        message: 'This request is assigned to another officer in your department.'
      });
    }

    await syncTaskChecklistFromRequest(myTask, request);

    const { stage, note } = req.body;
    const stages = getStagesByCategory(request.requestCategory);

    if (!stage || !stages.includes(stage)) {
      return res.status(400).json({ message: 'Invalid stage.' });
    }

    if (!canMoveToStage(request, stage)) {
      return res.status(400).json({
        message: 'Stage must move step by step only.'
      });
    }

    request.currentStage = stage;
    request.status = stage;
    request.timeline.push({
      stage,
      note: note || `Stage moved to ${stage}`,
      updatedBy: safeUpdatedBy(req.user)
    });

    await request.save();
    if (request.requestCategory === 'document' && stage === 'Certificate Generated') {
      const existingCertificate = await Certificate.findOne({ requestId: request._id });

      if (!existingCertificate) {
        const tasks = await DepartmentTask.find({ requestId: request._id });
        const anyRejected = tasks.some((t) => t.status === 'rejected');
        const allApproved = tasks.length > 0 && tasks.every((t) => t.status === 'approved');

        if (!anyRejected && allApproved) {
          const documentData = { ...request.documentData, approvedBy: req.user.name };

          const result = await generateCertificate(
            request.requestType,
            documentData,
            req.user.name
          );

          const actualFilePath = result.filepath;
          if (!actualFilePath || !fs.existsSync(actualFilePath)) {
            return res.status(500).json({ message: 'Certificate PDF file was not created.' });
          }

          const cert = new Certificate({
            requestId: request._id,
            certificateId: result.certificateId,
            documentType: request.requestType,
            pdfPath: `uploads/certificates/${path.basename(actualFilePath)}`,
            issuedBy: req.user.officerId || req.user._id || null
          });

          await cert.save();

          request.status = 'Available for Download';
          request.currentStage = 'Available for Download';
          request.timeline.push({
            stage: 'Available for Download',
            note: `Certificate ${result.certificateId} generated and ready for download`,
            updatedBy: safeUpdatedBy(req.user)
          });

          await request.save();
        }
      }
    }

    const deptTasks = await DepartmentTask.find({
      requestId: request._id,
      department: req.user.department
    });

    for (const deptTask of deptTasks) {
      deptTask.stage = stage;
      deptTask.allowedStages = stages;
      deptTask.currentStageIndex = Math.max(stages.indexOf(stage), 0);
      deptTask.stageChecklist = buildStageChecklist(request, stage, deptTask.stageChecklist || []);
      deptTask.isStageChecklistCompleted =
        deptTask.stageChecklist.length > 0
          ? deptTask.stageChecklist.every((item) => item.checked)
          : true;

      if (deptTask.isStageChecklistCompleted) {
        deptTask.lastChecklistCompletedStage = stage;
      }

      deptTask.updatedAt = new Date();
      await deptTask.save();
    }

    await finalizeIfAllDepartmentsDone(request._id, req.user);
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generateCertificateForRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('userId', 'name email');

    if (!request) return res.status(404).json({ message: 'Request not found.' });

    if (request.requestCategory !== 'document') {
      return res.status(400).json({ message: 'Only document requests can have certificates.' });
    }

    const tasks = await DepartmentTask.find({ requestId: request._id });
    const anyRejected = tasks.some((t) => t.status === 'rejected');
    const allApproved = tasks.length > 0 && tasks.every((t) => t.status === 'approved');

    if (anyRejected) {
      return res.status(400).json({
        message: 'Cannot generate certificate because a department rejected this request.'
      });
    }

    if (!allApproved) {
      return res.status(400).json({
        message: 'Certificate can be generated only after all departments approve.'
      });
    }

    const existing = await Certificate.findOne({ requestId: request._id });
    if (existing) {
      return res.json({ certificate: existing, message: 'Certificate already generated.' });
    }

    const documentData = { ...request.documentData, approvedBy: req.user.name };

    const result = await generateCertificate(
      request.requestType,
      documentData,
      req.user.name
    );

    const filename = result.filename;
    const certificateId = result.certificateId;
    const actualFilePath = result.filepath;

    if (!actualFilePath || !fs.existsSync(actualFilePath)) {
      return res.status(500).json({ message: 'Certificate PDF file was not created.' });
    }

    const cert = new Certificate({
      requestId: request._id,
      certificateId,
      documentType: request.requestType,
      pdfPath: `uploads/certificates/${path.basename(actualFilePath)}`,
      issuedBy: req.user.officerId || req.user._id || null
    });

    await cert.save();

    request.currentStage = 'Certificate Generated';
    request.status = 'Certificate Generated';
    request.timeline.push({
      stage: 'Certificate Generated',
      note: `Certificate ${certificateId} generated`,
      updatedBy: safeUpdatedBy(req.user)
    });

    await request.save();
    await finalizeIfAllDepartmentsDone(request._id, req.user);

    res.status(201).json({ certificate: cert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.downloadCertificate = async (req, res) => {
  try {
    console.log('--- DOWNLOAD CERTIFICATE START ---');
    console.log('Request param id:', req.params.id);

    const request = await Request.findById(req.params.id);
    console.log('Found request:', request ? request._id : null);

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (
      req.user.role === 'citizen' &&
      request.userId.toString() !== req.user._id.toString()
    ) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied.' });
    }

    let certificate = await Certificate.findOne({ requestId: request._id });
    console.log('Certificate by ObjectId requestId:', certificate);

    if (!certificate) {
      certificate = await Certificate.findOne({
        $or: [
          { requestId: req.params.id },
          { requestId: String(req.params.id) }
        ]
      });
      console.log('Certificate by fallback search:', certificate);
    }

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    console.log('certificate.pdfPath =', certificate.pdfPath);

    const possiblePaths = [
      path.join(__dirname, '..', certificate.pdfPath || ''),
      path.join(__dirname, '..', 'uploads', 'certificates', path.basename(certificate.pdfPath || '')),
      path.join(process.cwd(), 'uploads', 'certificates', path.basename(certificate.pdfPath || ''))
    ];

    console.log('Possible paths:', possiblePaths);

    const filePath = possiblePaths.find((p) => p && fs.existsSync(p));
    console.log('Resolved filePath:', filePath);

    if (!filePath) {
      return res.status(404).json({ message: 'Certificate file not found.' });
    }

    console.log('Downloading file:', filePath);
    return res.download(filePath, path.basename(filePath));
  } catch (error) {
    console.error('Download certificate error:', error);
    return res.status(500).json({ message: 'Failed to download certificate.' });
  }
};
exports.getAnalytics = async (req, res) => {
  try {
    const total = await Request.countDocuments();

    const byCategory = await Request.aggregate([
      { $group: { _id: '$requestCategory', count: { $sum: 1 } } }
    ]);

    const byStatus = await Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recent = await Request.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.json({ total, byCategory, byStatus, recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComplaintAnalytics = async (req, res) => {
  try {
    const breakdown = await Request.aggregate([
      {
        $match: {
          requestCategory: 'complaint',
          requestType: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$requestType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1, _id: 1 }
      }
    ]);

    const totalComplaints = breakdown.reduce((sum, item) => sum + item.count, 0);

    const formattedBreakdown = breakdown.map((item) => ({
      type: item._id,
      count: item.count,
      percentage: totalComplaints > 0
        ? Number(((item.count / totalComplaints) * 100).toFixed(1))
        : 0
    }));

    const topComplaintType =
      formattedBreakdown.length > 0 ? formattedBreakdown[0].type : null;

    res.json({
      totalComplaints,
      topComplaintType,
      breakdown: formattedBreakdown
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDocumentAnalytics = async (req, res) => {
  try {
    const breakdown = await Request.aggregate([
      {
        $match: {
          requestCategory: 'document',
          requestType: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$requestType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1, _id: 1 }
      }
    ]);

    const totalDocuments = breakdown.reduce((sum, item) => sum + item.count, 0);

    const formattedBreakdown = breakdown.map((item) => ({
      type: item._id,
      count: item.count,
      percentage: totalDocuments > 0
        ? Number(((item.count / totalDocuments) * 100).toFixed(1))
        : 0
    }));

    const topDocumentType =
      formattedBreakdown.length > 0 ? formattedBreakdown[0].type : null;

    res.json({
      totalDocuments,
      topDocumentType,
      breakdown: formattedBreakdown
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.predictComplaintType = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.json({ predictedType: null });
    }

    const input = String(text).toLowerCase().trim();

    let predictedType = null;

    if (
      input.includes('தண்ணீர் கசிவு') ||
      input.includes('நீர் கசிவு') ||
      input.includes('தண்ணீர் கசிகிறது') ||
      input.includes('நீர் ஒழுகுகிறது') ||
      input.includes('குழாய் கசிகிறது')
    ) {
      predictedType = 'Water leakage';
    } else if (
      input.includes('சாலை சேதம்') ||
      input.includes('சாலை உடைந்துள்ளது') ||
      input.includes('சாலை மோசம்')
    ) {
      predictedType = 'Road damage';
    } else if (
      input.includes('சாலையில் குழி') ||
      input.includes('பள்ளம்') ||
      input.includes('குழி உள்ளது')
    ) {
      predictedType = 'Pothole';
    } else if (
      input.includes('தெரு விளக்கு') ||
      input.includes('விளக்கு வேலை செய்யவில்லை') ||
      input.includes('விளக்கு எரியவில்லை')
    ) {
      predictedType = 'Street light issue';
    } else if (
      input.includes('குப்பை அகற்றப்படவில்லை') ||
      input.includes('குப்பை தேங்கியுள்ளது') ||
      input.includes('குப்பை சேகரிக்கவில்லை')
    ) {
      predictedType = 'Garbage not collected';
    } else if (
      input.includes('வடிகால் அடைப்பு') ||
      input.includes('கழிவுநீர்') ||
      input.includes('தண்ணீர் மாசடைந்துள்ளது') ||
      input.includes('மாசான தண்ணீர்')
    ) {
      predictedType = 'Drainage blockage';
    } else if (
      input.includes('மரம் விழுந்துள்ளது') ||
      input.includes('சாலையில் மரம் விழுந்துள்ளது')
    ) {
      predictedType = 'Tree fallen on road';
    }

    if (!predictedType) {
      const result = predictComplaintTypeML(text);
      predictedType = result?.predictedType || null;
    }

    res.json({ predictedType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.predictDocumentType = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.json({ predictedType: null });
    }

    const input = String(text).toLowerCase().trim();

    let predictedType = null;

    if (input.includes('பிறப்பு சான்றிதழ்')) {
      predictedType = 'Birth Certificate';
    } else if (
      input.includes('நில உரிமை சான்றிதழ்') ||
      input.includes('நில சான்றிதழ்')
    ) {
      predictedType = 'Land Ownership Certificate';
    } else if (input.includes('வருமான சான்றிதழ்')) {
      predictedType = 'Income Certificate';
    } else if (
      input.includes('கட்டிடம் அனுமதி') ||
      input.includes('கட்டிட அனுமதி')
    ) {
      predictedType = 'Building Approval';
    } else if (
      input.includes('வணிக உரிமம்') ||
      input.includes('கடை உரிமம்')
    ) {
      predictedType = 'Business License';
    } else if (
      input.includes('புதிய நீர் இணைப்பு') ||
      input.includes('நீர் இணைப்பு')
    ) {
      predictedType = 'New Water Connection';
    } else if (
      input.includes('மின்சாரம் இணைப்பு') ||
      input.includes('புதிய மின் இணைப்பு')
    ) {
      predictedType = 'Electricity Connection';
    }

    if (!predictedType) {
      const result = predictDocumentTypeML(text);
      predictedType = result?.predictedType || null;
    }

    res.json({ predictedType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};