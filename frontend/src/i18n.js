import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      topbar: {
        signIn: 'Sign In',
        register: 'Register',
      },

      header: {
        portalTitle: 'tamilnadu.gov.in',
        topics: 'Topics',
        services: 'Services',
        government: 'Government',
        groups: 'Groups',
        aboutIndia: 'About India',
      },

      common: {
        search: 'Search',
        download: 'Download',
        view: 'View',
        cancel: 'Cancel',
      },

      dashboard: {
        bannerTitle: 'Citizen Service Request and Document Portal',
        bannerDescription:
          'Access grievance redressal, application tracking, and downloadable public certificates.',
        citizenServices: 'Citizen Services',
        searchFilterTitle: 'Search and Filter Requests',
        requestSearchPlaceholder: 'Request ID or type...',
        myRequests: 'My Requests',

        noDocumentApplied: 'You did not apply for "{{search}}".',
        noComplaintSubmitted:
          'You did not submit a complaint for "{{search}}".',
        noMatchingRequest:
          'No matching request found for "{{search}}".',
        noRequestsFound: 'No requests found.',

        sections: {
          featuredServices: 'Featured Services',
          requestedInfo: 'Requested Information & Forms',
          activities: 'Activities & Initiatives',
        },

        links: {
          submitComplaint: 'Submit Complaint',
          applyDocument: 'Apply for Document',
          trackRequest: 'Track Request Status',
          downloadCertificates: 'Download Certificates',
        },

        filters: {
          allTypes: 'All Types',
          complaint: 'Complaint',
          document: 'Document',
          allStatus: 'All Status',
        },

        stats: {
          totalRequests: 'Total Requests',
          complaints: 'Complaints',
          documents: 'Documents',
          downloadReady: 'Download Ready',
        },
      },

      table: {
        requestId: 'Request ID',
        type: 'Type',
        category: 'Category',
        status: 'Status',
        date: 'Date',
        action: 'Action',
      },

      status: {
        submitted: 'Submitted',
        pending: 'Pending',
        inProgress: 'In Progress',
        underReview: 'Under Review',
        approved: 'Approved',
        rejected: 'Rejected',
        resolved: 'Resolved',
        certificateGenerated: 'Certificate Generated',
        availableForDownload: 'Available for Download',
      },

      
      submitComplaint: {
        headingSubmit: 'Submit',
        headingA: 'a',
        headingComplaint: 'Complaint',
      
        complaintTypeSection: 'Complaint Type',
        complaintType: 'Complaint Type',
        selectType: 'Select type',   // ✅ missing before
      
        locationDetails: 'Location Details',
        locationArea: 'Location / Area',
        locationPlaceholder: 'Street, landmark',   // ✅ missing before
      
        areaWard: 'Area / Ward',
        areaPlaceholder: 'Ward number or area name',   // ✅ missing before
      
        exactAddress: 'Exact Address',
        exactAddressPlaceholder: 'Door number, street name',
      
        nearestLandmark: 'Nearest Landmark',
        landmarkPlaceholder: 'Nearby school, temple, bus stop',
      
        complaintDescription: 'Complaint Description',
        description: 'Description',
      
        priority: 'Priority',
      
        imageOptional: 'Image (optional)',
      
        contactSection: 'Contact Details',
        citizenContactNumber: 'Citizen Contact Number',
        contactNumberPlaceholder: 'Enter mobile number',
      
        preferredInspectionTime: 'Preferred Inspection Time',
        selectPreferredInspectionTime: 'Select preferred inspection time',
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening',
        anytime: 'Anytime',
      
        submitButton: 'Submit Complaint',
        submitting: 'Submitting...',
        failed: 'Failed to submit complaint.',
      },
      

      submitDocument: {
        headingApply: 'Apply',
        headingFor: 'for',
        headingDocument: 'a Document',
        documentSelection: 'Document Selection',
        documentType: 'Document Type',
        selectDocument: 'Select document',
        applicationPriority: 'Application Priority',
        priority: 'Priority',
        documentDetails: 'Document Details',
        submitButton: 'Submit Application',
        submitting: 'Submitting...',
        fields: {
          childName: 'Child Name',
          parentName: 'Parent Name',
          dateOfBirth: 'Date of Birth',
          gender: 'Gender',
          hospitalName: 'Hospital Name',
          placeOfBirth: 'Place of Birth',
          address: 'Address',
          ownerName: 'Owner Name',
          fatherMotherName: 'Father / Mother Name',
          surveyNumber: 'Survey Number',
          landLocation: 'Land Location',
          taluk: 'Taluk',
          district: 'District',
          areaSize: 'Area Size',
          pattaNumber: 'Patta Number',
          applicantName: 'Applicant Name',
          annualIncome: 'Annual Income',
          occupation: 'Occupation',
          familyMembersCount: 'Family Members Count',
          buildingType: 'Building Type',
          plotNumber: 'Plot Number',
          streetArea: 'Street / Area',
          landArea: 'Land Area',
          buildingArea: 'Building Area',
          businessName: 'Business Name',
          businessType: 'Business Type',
          registrationNumber: 'Registration Number',
          shopAddress: 'Shop / Office Address',
          contactNumber: 'Contact Number',
          houseNumber: 'House Number',
          existingWaterSource: 'Existing Water Source',
        },
      },

      documentTypes: {
        birthCertificate: 'Birth Certificate',
        landOwnershipCertificate: 'Land Ownership Certificate',
        incomeCertificate: 'Income Certificate',
        buildingApproval: 'Building Approval',
        businessLicense: 'Business License',
        newWaterConnection: 'New Water Connection',
        electricityConnection: 'Electricity Connection',
      },

      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent',
      },

      complaintTypes: {
        waterLeakage: 'Water leakage',
        roadDamage: 'Road damage',
        pothole: 'Pothole',
        streetLightIssue: 'Street light issue',
        garbageNotCollected: 'Garbage not collected',
        drainageBlockage: 'Drainage blockage',
        treeFallenOnRoad: 'Tree fallen on road',
      },
    },
  },

  ta: {
    translation: {
      topbar: {
        signIn: 'உள்நுழை',
        register: 'பதிவு செய்',
      },

      header: {
        portalTitle: 'தமிழ்நாடு.அரசு.தளம்',
        topics: 'தலைப்புகள்',
        services: 'சேவைகள்',
        government: 'அரசு',
        groups: 'குழுக்கள்',
        aboutIndia: 'இந்தியாவைப் பற்றி',
      },

      common: {
        search: 'தேடல்',
        download: 'பதிவிறக்கு',
        view: 'பார்',
        cancel: 'ரத்து',
      },

      dashboard: {
        bannerTitle:
          'குடிமக்கள் சேவை கோரிக்கை மற்றும் ஆவண தளம்',
        bannerDescription:
          'புகார் தீர்வு, விண்ணப்ப கண்காணிப்பு மற்றும் பதிவிறக்கக்கூடிய பொது சான்றிதழ்களை அணுகவும்.',
        citizenServices: 'குடிமக்கள் சேவைகள்',
        searchFilterTitle:
          'கோரிக்கைகளை தேடி வடிகட்டு',
        requestSearchPlaceholder:
          'கோரிக்கை ஐடி அல்லது வகை...',
        myRequests: 'என் கோரிக்கைகள்',

        noDocumentApplied:
          '"{{search}}" க்கு நீங்கள் விண்ணப்பிக்கவில்லை.',
        noComplaintSubmitted:
          '"{{search}}" குறித்து நீங்கள் புகார் அளிக்கவில்லை.',
        noMatchingRequest:
          '"{{search}}" க்கு பொருந்தும் கோரிக்கை இல்லை.',
        noRequestsFound:
          'கோரிக்கைகள் எதுவும் இல்லை.',

        sections: {
          featuredServices: 'சிறப்பு சேவைகள்',
          requestedInfo:
            'கோரப்பட்ட தகவல்கள் மற்றும் படிவங்கள்',
          activities:
            'செயல்பாடுகள் மற்றும் முயற்சிகள்',
        },

        links: {
          submitComplaint:
            'புகார் சமர்ப்பிக்கவும்',
          applyDocument:
            'ஆவணத்திற்கு விண்ணப்பிக்கவும்',
          trackRequest:
            'கோரிக்கை நிலையை காண்க',
          downloadCertificates:
            'சான்றிதழ்களை பதிவிறக்கவும்',
        },

        filters: {
          allTypes: 'அனைத்து வகைகள்',
          complaint: 'புகார்',
          document: 'ஆவணம்',
          allStatus: 'அனைத்து நிலைகள்',
        },

        stats: {
          totalRequests: 'மொத்த கோரிக்கைகள்',
          complaints: 'புகார்கள்',
          documents: 'ஆவணங்கள்',
          downloadReady:
            'பதிவிறக்கத்திற்கு தயாராக உள்ளது',
        },
      },

      table: {
        requestId: 'கோரிக்கை ஐடி',
        type: 'வகை',
        category: 'பிரிவு',
        status: 'நிலை',
        date: 'தேதி',
        action: 'செயல்',
      },

      status: {
        submitted: 'சமர்ப்பிக்கப்பட்டது',
        pending: 'நிலுவையில்',
        inProgress:
          'நடைபெற்று வருகிறது',
        underReview:
          'மதிப்பாய்வில்',
        approved:
          'அங்கீகரிக்கப்பட்டது',
        rejected:
          'நிராகரிக்கப்பட்டது',
        resolved: 'தீர்க்கப்பட்டது',
        certificateGenerated:
          'சான்றிதழ் உருவாக்கப்பட்டது',
        availableForDownload:
          'பதிவிறக்கத்திற்கு தயாராக உள்ளது',
      },

      submitComplaint: {
        headingSubmit: 'புகார்',
        headingA: 'ஒன்று',
        headingComplaint: 'சமர்ப்பிக்கவும்',
      
        complaintTypeSection: 'புகார் வகை',
        complaintType: 'புகார் வகை',
        selectType: 'வகையைத் தேர்ந்தெடுக்கவும்',
      
        locationDetails: 'இட விவரங்கள்',
        locationArea: 'இடம் / பகுதி',
        locationPlaceholder: 'தெரு, அடையாளம்',
      
        areaWard: 'பகுதி / வார்டு',
        areaPlaceholder: 'வார்டு எண் அல்லது பகுதி பெயர்',
      
        exactAddress: 'சரியான முகவரி',
        exactAddressPlaceholder: 'வீட்டு எண், தெரு பெயர்',
      
        nearestLandmark: 'அருகிலுள்ள அடையாளம்',
        landmarkPlaceholder: 'பள்ளி, கோவில், பேருந்து நிறுத்தம் அருகில்',
      
        complaintDescription: 'புகார் விவரம்',
        description: 'விளக்கம்',
      
        priority: 'முன்னுரிமை',
      
        imageOptional: 'படம் (விருப்பம்)',
      
        contactSection: 'தொடர்பு விவரங்கள்',
        citizenContactNumber: 'குடிமக்கள் தொடர்பு எண்',
        contactNumberPlaceholder: 'மொபைல் எண்ணை உள்ளிடவும்',
      
        preferredInspectionTime: 'விருப்பமான ஆய்வு நேரம்',
        selectPreferredInspectionTime: 'ஆய்வு நேரத்தை தேர்ந்தெடுக்கவும்',
        morning: 'காலை',
        afternoon: 'மதியம்',
        evening: 'மாலை',
        anytime: 'எப்போதும்',
      
        submitButton: 'புகார் சமர்ப்பிக்கவும்',
        submitting: 'சமர்ப்பிக்கப்படுகிறது...',
        failed: 'புகாரை சமர்ப்பிக்க முடியவில்லை.',
      },   

      submitDocument: {
        headingApply: 'விண்ணப்பிக்க',
        headingFor: 'ஒரு',
        headingDocument:
          'ஆவணம்',
        documentSelection:
          'ஆவணத் தேர்வு',
        documentType:
          'ஆவண வகை',
        selectDocument:
          'ஆவணத்தைத் தேர்ந்தெடுக்கவும்',
        applicationPriority:
          'விண்ணப்ப முன்னுரிமை',
        priority:
          'முன்னுரிமை',
        documentDetails:
          'ஆவண விவரங்கள்',
        submitButton:
          'விண்ணப்பத்தை சமர்ப்பிக்கவும்',
        submitting:
          'சமர்ப்பிக்கப்படுகிறது...',
        fields: {
          childName: 'குழந்தையின் பெயர்',
          parentName: 'பெற்றோர் பெயர்',
          dateOfBirth: 'பிறந்த தேதி',
          gender: 'பாலினம்',
          hospitalName: 'மருத்துவமனை பெயர்',
          placeOfBirth: 'பிறந்த இடம்',
          address: 'முகவரி',
          ownerName: 'உரிமையாளர் பெயர்',
          fatherMotherName: 'தந்தை / தாய் பெயர்',
          surveyNumber: 'சர்வே எண்',
          landLocation: 'நிலத்தின் இடம்',
          taluk: 'தாலுக்கு',
          district: 'மாவட்டம்',
          areaSize: 'பரப்பளவு',
          pattaNumber: 'பட்டா எண்',
          applicantName: 'விண்ணப்பதாரர் பெயர்',
          annualIncome: 'வருடாந்திர வருமானம்',
          occupation: 'தொழில்',
          familyMembersCount: 'குடும்ப உறுப்பினர் எண்ணிக்கை',
          buildingType: 'கட்டிட வகை',
          plotNumber: 'பிளாட் எண்',
          streetArea: 'தெரு / பகுதி',
          landArea: 'நிலப்பரப்பு',
          buildingArea: 'கட்டிட பரப்பு',
          businessName: 'வணிகத்தின் பெயர்',
          businessType: 'வணிக வகை',
          registrationNumber: 'பதிவு எண்',
          shopAddress: 'கடை / அலுவலக முகவரி',
          contactNumber: 'தொடர்பு எண்',
          houseNumber: 'வீட்டு எண்',
          existingWaterSource: 'தற்போதைய நீர் மூலாதாரம்',
        },
      },

      documentTypes: {
        birthCertificate:
          'பிறப்புச் சான்றிதழ்',
        landOwnershipCertificate:
          'நில உரிமைச் சான்றிதழ்',
        incomeCertificate:
          'வருமானச் சான்றிதழ்',
        buildingApproval:
          'கட்டிடம் அனுமதி',
        businessLicense:
          'வணிக உரிமம்',
        newWaterConnection:
          'புதிய நீர் இணைப்பு',
        electricityConnection:
          'மின்சார இணைப்பு',
      },

      priority: {
        low: 'குறைவு',
        medium: 'மிதமான',
        high: 'அதிகம்',
        urgent: 'அவசரம்',
      },

      complaintTypes: {
        waterLeakage: 'நீர் கசிவு',
        roadDamage: 'சாலை சேதம்',
        pothole: 'சாலைக் குழி',
        streetLightIssue:
          'தெருவிளக்கு பிரச்சனை',
        garbageNotCollected:
          'குப்பை அகற்றப்படவில்லை',
        drainageBlockage:
          'வடிகால் அடைப்பு',
        treeFallenOnRoad:
          'சாலையில் விழுந்த மரம்',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;