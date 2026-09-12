import React, { useState, useRef } from 'react';
import {
  Camera,
  Image as ImageIcon,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Info,
  Layers,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
  HardDrive,
  CloudOff,
  Save,
  Clock,
  Check,
} from 'lucide-react';
import { CropInfo, Language } from '../types';
import { translations } from '../i18n/translations';
import { validateCropImage } from '../services/imageValidationService';
import { useNetworkStatus } from '../offline/hooks/useNetworkStatus';
import { useOfflineDrafts } from '../offline/hooks/useOfflineDrafts';
import { OfflineStatusBadge } from '../offline/components/OfflineStatusBadge';
import { storeLocalAttachment } from '../offline/utils/photoOptimizer';
import { addQueueItem } from '../offline/storage/repositories/syncQueueRepository';

interface ImageUploadScreenProps {
  crop: CropInfo;
  language: Language;
  onBack: () => void;
  onChangeCrop: () => void;
  onStartAnalysis: (
    imageBase64: string,
    farmerNotes?: string,
    location?: string,
    previousDiagnosis?: string
  ) => void;
  isAnalyzing: boolean;
  onOpenDemoScenarios?: () => void;
  onOpenSyncDashboard?: () => void;
}

// Major agricultural states in India
const INDIAN_STATES = [
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Maharashtra',
  'Rajasthan',
  'Gujarat',
  'Bihar',
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Odisha',
  'Other / Not Listed',
];

// Curated high-resolution agricultural sample leaves for instant testing
const SAMPLE_LEAF_IMAGES: { name: string; url: string; label: string }[] = [
  {
    name: 'Early Blight (Tomato Leaf)',
    label: 'Tomato Early Blight Sample',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Leaf Rust / Blight (Wheat)',
    label: 'Leaf Rust / Blight Sample',
    url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pest Infestation (Caterpillar)',
    label: 'Pest Feeding Sample',
    url: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Healthy Foliage',
    label: 'Healthy Foliage Sample',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
  },
];

export const ImageUploadScreen: React.FC<ImageUploadScreenProps> = ({
  crop,
  language,
  onBack,
  onChangeCrop,
  onStartAnalysis,
  isAnalyzing,
  onOpenDemoScenarios,
  onOpenSyncDashboard,
}) => {
  const t = translations[language];
  const isHi = language === 'hi';

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const { isOffline, isWeak } = useNetworkStatus(language);
  const { drafts, saveDraft } = useOfflineDrafts();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [savedOfflineDraft, setSavedOfflineDraft] = useState<{ id: string; queued: boolean } | null>(null);

  // Farmer Context Form (Part 2 Engine)
  const [farmerNotes, setFarmerNotes] = useState('');
  const [location, setLocation] = useState('');
  const [showAdvancedContext, setShowAdvancedContext] = useState(false);

  // Find any existing draft for this crop
  const existingDraft = drafts.find(
    (d) => d.cropName?.toLowerCase() === crop.name.toLowerCase() && d.draftType === 'DIAGNOSIS'
  );

  const handleResumeDraft = (draft: typeof existingDraft) => {
    if (!draft) return;
    if (draft.imageUri) setPreviewImage(draft.imageUri);
    if (draft.notes) setFarmerNotes(draft.notes);
    if (draft.location) setLocation(draft.location);
  };

  // Save photo & draft locally
  const handleSaveDraftLocally = async (queueForSync: boolean) => {
    if (!previewImage) return;
    setIsSavingDraft(true);

    try {
      const att = await storeLocalAttachment({
        dataUri: previewImage,
        fileName: `${crop.name}-${Date.now()}.jpg`,
        lowDataMode: isWeak,
      });

      const draftId = `draft-${Date.now()}`;
      await saveDraft({
        id: draftId,
        draftType: 'DIAGNOSIS',
        title: `${crop.name} Health Check`,
        titleHi: `${crop.hindiName || crop.name} फसल स्वास्थ्य जांच`,
        cropName: crop.name,
        notes: farmerNotes,
        location,
        imageUri: att.optimizedDataUri || previewImage,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: queueForSync ? 'WAITING_TO_SYNC' : 'DRAFT',
      });

      if (queueForSync) {
        await addQueueItem({
          queueId: `queue-${Date.now()}`,
          entityType: 'REPORT',
          entityId: draftId,
          localId: draftId,
          operation: 'CREATE',
          priority: 'HIGH',
          clientRequestId: `req-diag-${draftId}`,
          payload: {
            cropName: crop.name,
            farmerNotes,
            location,
            imageUri: att.optimizedDataUri || previewImage,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
          maxRetries: 4,
          status: 'PENDING',
        });
      }

      setSavedOfflineDraft({
        id: draftId,
        queued: queueForSync,
      });
    } catch (err) {
      console.error('Failed to save offline draft:', err);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Handle file selection from camera or gallery
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setIsValidating(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewImage(dataUrl);

      // Perform farmer-first image validation
      const validation = await validateCropImage(dataUrl, language);
      setIsValidating(false);

      if (!validation.isValid) {
        setValidationError(validation.farmerMessage || t.validationDefaultError);
      }
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be reselected if needed
    event.target.value = '';
  };

  // Select sample photo for instant preview & test
  const handleSelectSample = async (url: string) => {
    setValidationError(null);
    setIsValidating(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPreviewImage(dataUrl);
          const validation = await validateCropImage(dataUrl, language);
          setIsValidating(false);
          if (!validation.isValid) {
            setValidationError(validation.farmerMessage || t.validationDefaultError);
          }
        }
      };
      img.onerror = () => {
        setPreviewImage(url);
        setIsValidating(false);
      };
      img.src = url;
    } catch {
      setPreviewImage(url);
      setIsValidating(false);
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    setValidationError(null);
    setSavedOfflineDraft(null);
  };

  const handleTriggerAnalysis = () => {
    if (!previewImage || validationError) return;

    if (isOffline) {
      handleSaveDraftLocally(true);
      return;
    }

    onStartAnalysis(
      previewImage,
      farmerNotes.trim() || undefined,
      location.trim() || undefined
    );
  };

  // Quick note appender
  const appendQuickNote = (noteText: string) => {
    if (!farmerNotes) {
      setFarmerNotes(noteText);
    } else if (!farmerNotes.includes(noteText)) {
      setFarmerNotes(`${farmerNotes}; ${noteText}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Hidden native camera and gallery inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="upload-back-btn"
          onClick={onBack}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-2xs disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHi ? 'फसल चयन' : 'Change Crop'}</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenDemoScenarios && (
            <button
              id="open-demo-scenarios-top-btn"
              onClick={onOpenDemoScenarios}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-full border border-amber-300 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.demoModeBadge}</span>
            </button>
          )}

          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Step 2 / 4
          </span>
        </div>
      </div>

      {/* Selected Crop Sticky Card */}
      <div className="bg-emerald-800 text-white rounded-2xl p-4 shadow-xs mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-700/90 flex items-center justify-center text-2xl shadow-inner">
            {crop.icon}
          </div>
          <div>
            <span className="text-[11px] uppercase font-semibold tracking-wider text-emerald-200">
              {t.selectedCropLabel}
            </span>
            <h3 className="text-lg font-bold leading-tight">
              {crop.name}{' '}
              <span className="text-sm font-medium text-emerald-200">
                ({crop.hindiName})
              </span>
            </h3>
          </div>
        </div>

        <button
          id="change-crop-badge-btn"
          onClick={onChangeCrop}
          disabled={isAnalyzing}
          className="text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-950 text-amber-300 px-3 py-1.5 rounded-lg border border-emerald-700 transition disabled:opacity-50"
        >
          {t.changeCrop}
        </button>
      </div>

      {/* Offline Status Notice */}
      {isOffline && (
        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
          <CloudOff className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900">
                {isHi ? 'ऑफलाइन मोड सक्रिय' : 'Offline Mode Active'}
              </span>
              <OfflineStatusBadge status="PENDING_SYNC" language={language} />
            </div>
            <p className="text-amber-800 mt-1 leading-relaxed">
              {isHi
                ? 'इंटरनेट कनेक्शन नहीं है। आप फोटो ले सकते हैं और नोट्स दर्ज कर सकते हैं — सब कुछ फोन में सुरक्षित सहेज लिया जाएगा और कनेक्शन आने पर स्वतः विश्लेषण होगा।'
                : 'No internet connection. You can still capture photos and notes — they are safely preserved on your device and queued for automatic analysis when back online.'}
            </p>
          </div>
        </div>
      )}

      {/* Resume Draft Banner if available */}
      {existingDraft && !previewImage && !savedOfflineDraft && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {isHi
                ? `इस फसल का सहेजा गया ड्राफ्ट उपलब्ध है (${new Date(existingDraft.updatedAt).toLocaleTimeString()})`
                : `Saved draft available for ${crop.name} (${new Date(existingDraft.updatedAt).toLocaleTimeString()})`}
            </span>
          </div>
          <button
            id="resume-crop-draft-btn"
            onClick={() => handleResumeDraft(existingDraft)}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition"
          >
            {isHi ? 'ड्राफ्ट खोलें' : 'Resume Draft'}
          </button>
        </div>
      )}

      {/* Offline Saved Confirmation Card */}
      {savedOfflineDraft ? (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 text-center space-y-4 shadow-sm animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <HardDrive className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-black uppercase">
                {isHi ? 'फोन में सुरक्षित सहेजा गया' : 'Saved Locally on Device'}
              </span>
              <OfflineStatusBadge status="PENDING_SYNC" language={language} />
            </div>

            <h3 className="text-xl font-black text-emerald-950">
              {isHi ? `${crop.name} की जांच कतार में है` : `${crop.name} Queued for Sync`}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto mt-2 leading-relaxed">
              {isHi
                ? 'आपकी फसल की तस्वीर और नोट्स फोन की स्थानीय मेमोरी में सुरक्षित रख लिए गए हैं। जैसे ही इंटरनेट कनेक्ट होगा, AI द्वारा स्वतः फसल रोग का विश्लेषण किया जाएगा।'
                : 'Your crop photo and diagnostic notes are securely stored in your phone memory. When an internet connection is detected, Krishi Mentor will automatically analyze the crop and notify you.'}
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
            {onOpenSyncDashboard && (
              <button
                id="view-sync-queue-from-upload-btn"
                onClick={onOpenSyncDashboard}
                className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <HardDrive className="w-4 h-4 text-amber-300" />
                <span>{isHi ? 'सिंक कतार देखें' : 'View Sync Queue'}</span>
              </button>
            )}

            <button
              id="capture-another-crop-btn"
              onClick={handleRetake}
              className="px-5 py-3 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold text-xs rounded-xl shadow-2xs transition flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4 text-stone-600" />
              <span>{isHi ? 'दूसरी फोटो लें' : 'Capture Another'}</span>
            </button>

            <button
              id="back-home-from-offline-save-btn"
              onClick={onBack}
              className="px-4 py-3 text-stone-600 hover:text-stone-900 font-semibold text-xs"
            >
              {isHi ? 'वापस जाएं' : 'Done / Go Back'}
            </button>
          </div>
        </div>
      ) : !previewImage ? (
        <div>
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
              {t.showUsCropTitle}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-1.5">
              {isHi
                ? 'बीमार पत्ती, तने या कीट की साफ तस्वीर लें ताकि AI सही जांच कर सके।'
                : 'Capture or upload a clear photo of the infected leaf, stem, or pest.'}
            </p>
          </div>

          {/* Two Large Action Buttons (Optimized for Farmer Smartphone Use) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Take Photo Button */}
            <button
              id="take-photo-btn"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 sm:p-8 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-2xl shadow-md transition group border-2 border-emerald-600"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/80 flex items-center justify-center mb-3 group-hover:scale-105 transition shadow-inner">
                <Camera className="w-9 h-9 text-amber-300 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold">{t.takePhoto}</span>
              <span className="text-xs text-emerald-200 mt-1 font-medium">
                {isHi ? 'कैमरे से सीधे फोटो खींचें' : 'Use smartphone camera'}
              </span>
            </button>

            {/* Upload from Gallery Button */}
            <button
              id="upload-gallery-btn"
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white hover:bg-stone-50 active:scale-98 text-stone-900 rounded-2xl shadow-xs transition border-2 border-stone-300 hover:border-emerald-600 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-3 group-hover:scale-105 transition shadow-inner">
                <ImageIcon className="w-9 h-9 text-emerald-700 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold">{t.uploadGallery}</span>
              <span className="text-xs text-stone-500 mt-1 font-medium">
                {isHi ? 'मोबाइल की गैलरी से चुनें' : 'Select from photo library'}
              </span>
            </button>
          </div>

          {/* Optional Farmer Context Accordion (Part 2 Engine) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 shadow-2xs">
            <button
              id="toggle-field-context-btn"
              onClick={() => setShowAdvancedContext(!showAdvancedContext)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-bold text-stone-900">
                  {t.farmerNotesLabel}
                </span>
                <span className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                  {isHi ? 'वैकल्पिक' : 'Optional'}
                </span>
              </div>
              {showAdvancedContext ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {showAdvancedContext && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.locationLabel}
                  </label>
                  <select
                    id="farmer-location-select"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">{t.selectLocationPlaceholder}</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHi ? 'आपने खेत में क्या देखा?' : 'What did you observe in the field?'}
                  </label>
                  <textarea
                    id="farmer-notes-input"
                    rows={2}
                    value={farmerNotes}
                    onChange={(e) => setFarmerNotes(e.target.value)}
                    placeholder={t.farmerNotesPlaceholder}
                    className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Quick Field Context One-Tap Chips */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                    {t.fieldNotesQuickTitle}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => appendQuickNote(t.quickNoteRain)}
                      className="text-[11px] bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition"
                    >
                      + {t.quickNoteRain}
                    </button>
                    <button
                      type="button"
                      onClick={() => appendQuickNote(t.quickNoteYellowing)}
                      className="text-[11px] bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition"
                    >
                      + {t.quickNoteYellowing}
                    </button>
                    <button
                      type="button"
                      onClick={() => appendQuickNote(t.quickNoteWilting)}
                      className="text-[11px] bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition"
                    >
                      + {t.quickNoteWilting}
                    </button>
                    <button
                      type="button"
                      onClick={() => appendQuickNote(t.quickNoteInsects)}
                      className="text-[11px] bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 transition"
                    >
                      + {t.quickNoteInsects}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Farmer Guidance Box */}
          <div className="bg-stone-100/90 border border-stone-200 rounded-2xl p-4 sm:p-5 mb-6">
            <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-emerald-700" />
              <span>{t.photoGuidanceTitle}</span>
            </h4>
            <ul className="space-y-2 text-sm text-stone-700">
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{t.photoGuidance1}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{t.photoGuidance2}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{t.photoGuidance3}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{t.photoGuidance4}</span>
              </li>
            </ul>
          </div>

          {/* Quick Demo Sample Selector */}
          <div className="border-t border-stone-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {isHi ? 'त्वरित नमूना तस्वीरें (परीक्षण के लिए)' : 'Test with sample crop leaf photos'}
              </span>

              {onOpenDemoScenarios && (
                <button
                  onClick={onOpenDemoScenarios}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                >
                  {isHi ? 'सभी परिदृश्य देखें' : 'View All Scenarios'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_LEAF_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  id={`sample-leaf-${idx}`}
                  onClick={() => handleSelectSample(sample.url)}
                  className="group relative rounded-xl overflow-hidden border border-stone-200 hover:border-emerald-600 text-left transition bg-white shadow-2xs focus:outline-none"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-20 object-cover group-hover:scale-105 transition"
                  />
                  <div className="p-1.5 bg-white">
                    <p className="text-[11px] font-semibold text-stone-800 truncate">
                      {sample.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview & Validation Screen */
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-stone-900 leading-snug">
              {isHi ? 'फोटो की समीक्षा करें' : 'Review Crop Photo'}
            </h2>
            <p className="text-stone-600 text-sm mt-1">
              {isHi
                ? 'यदि फोटो साफ है तो "फसल की जांच करें" पर टैप करें।'
                : 'Confirm the damaged area or pest is clearly visible before analysis.'}
            </p>
          </div>

          {/* Preview Image Card */}
          <div className="relative rounded-2xl overflow-hidden bg-stone-950 border-2 border-stone-200 shadow-md mb-4 aspect-4/3 flex items-center justify-center">
            <img
              src={previewImage}
              alt="Uploaded crop preview"
              className="max-h-full max-w-full object-contain"
            />

            {isValidating && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-300 mb-2" />
                <span className="text-sm font-medium">Checking photo quality...</span>
              </div>
            )}
          </div>

          {/* Validation Error Alert if poor quality */}
          {validationError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-5 flex items-start gap-3 text-red-900">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-red-800">
                  {t.validationErrorTitle}
                </h4>
                <p className="text-xs sm:text-sm text-red-700 mt-1 leading-relaxed">
                  {validationError}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              id="analyze-crop-btn"
              onClick={handleTriggerAnalysis}
              disabled={isAnalyzing || Boolean(validationError) || isValidating || isSavingDraft}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-md transition active:scale-98 ${
                isAnalyzing || Boolean(validationError) || isValidating || isSavingDraft
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : isOffline
                  ? 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-900/20'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
                  <span>{t.analyzingTitle}</span>
                </>
              ) : isSavingDraft ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-300" />
                  <span>{isHi ? 'फोन में सहेज रहे हैं...' : 'Saving to phone...'}</span>
                </>
              ) : isOffline ? (
                <>
                  <HardDrive className="w-6 h-6 text-amber-300" />
                  <span>{isHi ? 'सहेजें व कतार में जोड़ें' : 'Save & Queue for Analysis'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-amber-300" />
                  <span>{t.analyzeCrop}</span>
                </>
              )}
            </button>

            {/* Optional Save as Offline Draft button */}
            {!isOffline && (
              <button
                id="save-offline-draft-btn"
                onClick={() => handleSaveDraftLocally(false)}
                disabled={isAnalyzing || isSavingDraft}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-stone-600" />
                <span>{isHi ? 'ड्राफ्ट के रूप में सहेजें' : 'Save as Offline Draft'}</span>
              </button>
            )}

            <button
              id="retake-photo-btn"
              onClick={handleRetake}
              disabled={isAnalyzing || isSavingDraft}
              className="w-full py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.retakePhoto}</span>
            </button>
          </div>

          {/* Analyzing Feedback Overlay */}
          {isAnalyzing && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-pulse">
              <p className="text-sm font-bold text-emerald-900">
                {t.analyzingTitle}
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                {t.analyzingSubtitle}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
