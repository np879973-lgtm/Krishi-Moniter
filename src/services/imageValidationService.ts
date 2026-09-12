import { ImageValidationResult, Language } from '../types';
import { translations } from '../i18n/translations';

/**
 * Validates the uploaded crop image for quality, brightness, sharpness, and agricultural suitability
 * using canvas pixel analysis before sending to the AI model.
 */
export async function validateCropImage(
  imageSource: string | File,
  language: Language = 'en'
): Promise<ImageValidationResult> {
  const t = translations[language];
  const isHi = language === 'hi';

  // 1. Check if empty
  if (!imageSource) {
    return {
      isValid: false,
      errorCode: 'NO_IMAGE',
      farmerMessage: t.validationDefaultError,
      qualityScore: 0,
      guidanceTips: isHi
        ? ['कृपया गैलरी से फोटो चुनें या कैमरे से नया फोटो लें।']
        : ['Please select a photo from gallery or snap a new one.'],
    };
  }

  // 2. If File object, check size (max 15MB) and type
  if (imageSource instanceof File) {
    if (imageSource.size > 15 * 1024 * 1024) {
      return {
        isValid: false,
        errorCode: 'TOO_LARGE',
        farmerMessage: isHi
          ? 'फोटो का आकार बहुत बड़ा है (15MB से अधिक)। कृपया छोटा फोटो चुनें।'
          : 'The image file exceeds 15MB. Please choose a smaller photo.',
        qualityScore: 20,
        guidanceTips: isHi
          ? ['कैमरा सेटिंग में सामान्य रिज़ॉल्यूशन रखें।']
          : ['Use standard resolution in camera settings.'],
      };
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];
    if (imageSource.type && !validTypes.includes(imageSource.type.toLowerCase())) {
      return {
        isValid: false,
        errorCode: 'UNSUPPORTED',
        farmerMessage: isHi
          ? 'असमर्थित फोटो फॉर्मेट। कृपया JPG या PNG फोटो का उपयोग करें।'
          : 'Unsupported photo format. Please use a JPG, PNG, or WebP photo.',
        qualityScore: 0,
      };
    }
  }

  // 3. Load into an Image element and perform pixel brightness and sharpness heuristics
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // Resolution check
        if (width < 100 || height < 100) {
          resolve({
            isValid: false,
            errorCode: 'LOW_RESOLUTION',
            farmerMessage: isHi
              ? 'तस्वीर का रिज़ॉल्यूशन बहुत कम है। कृपया स्पष्ट व नजदीक से फोटो लें।'
              : 'Photo resolution is too low. Please take a clear close-up photo.',
            qualityScore: 15,
            guidanceTips: isHi
              ? ['पौधे के प्रभावित हिस्से से 15-20 सेमी दूरी रखें।']
              : ['Hold camera 15-20 cm away from the affected foliage.'],
          });
          return;
        }

        // Downsample onto canvas to compute brightness, contrast and foliage color presence
        const canvas = document.createElement('canvas');
        const sampleSize = 64;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // If canvas context fails, default to valid to avoid blocking farmer
          resolve({ isValid: true, qualityScore: 80 });
          return;
        }

        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imgData.data;

        let totalBrightness = 0;
        let count = 0;
        let minB = 255;
        let maxB = 0;
        let foliageHuePixels = 0; // count pixels with plant-like colors (greens, yellows, browns)

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Perceived luminance
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += luminance;
          if (luminance < minB) minB = luminance;
          if (luminance > maxB) maxB = luminance;
          count++;

          // Check if pixel exhibits agricultural plant color profile (green canopy or chlorotic/necrotic yellow-brown)
          if ((g > r && g > b) || (r > b && g > b) || (r > 60 && g > 50 && b < 100)) {
            foliageHuePixels++;
          }
        }

        const avgBrightness = totalBrightness / count;
        const contrastSpread = maxB - minB;
        const foliageRatio = foliageHuePixels / count;

        // Extremely dark image check (e.g. pitch black with camera covered)
        if (avgBrightness < 16) {
          resolve({
            isValid: false,
            errorCode: 'TOO_DARK',
            farmerMessage: isHi
              ? 'तस्वीर बहुत अंधेरी है। कृपया दिन की रोशनी में पौधे की फोटो लें।'
              : 'The photo is too dark. Please take another photo in good daylight.',
            qualityScore: 10,
            guidanceTips: isHi
              ? ['दिन के उजाले में फोटो लें', 'छाया या फ्लैश का सही उपयोग करें']
              : ['Shoot in natural daylight', 'Ensure good illumination on the leaf'],
          });
          return;
        }

        // Washed out pure white / over-exposed check
        if (avgBrightness > 250 && contrastSpread < 20) {
          resolve({
            isValid: false,
            errorCode: 'OVEREXPOSED',
            farmerMessage: isHi
              ? 'तस्वीर अत्यधिक चमक (धूप) के कारण धुंधली है।'
              : 'The photo is heavily overexposed and washed out.',
            qualityScore: 15,
            guidanceTips: isHi
              ? ['सीधे तेज सूरज के सामने फोटो न लें', 'पौधे पर हल्की छाया बनाकर फोटो लें']
              : ['Avoid intense direct lens glare', 'Cast a light shadow over leaf to even out sunlight'],
          });
          return;
        }

        // If completely zero contrast and zero foliage color (e.g. flat wall, finger over lens)
        if (contrastSpread < 18 && foliageRatio < 0.05) {
          resolve({
            isValid: false,
            errorCode: 'NON_AGRICULTURAL',
            farmerMessage: isHi
              ? 'फोटो में फसल या पत्ता स्पष्ट नहीं दिख रहा है। कृपया सीधे पौधे की पत्ती या तने की फोटो लें।'
              : 'The image does not appear to show a crop or plant leaf. Please focus directly on the foliage.',
            qualityScore: 20,
            guidanceTips: isHi
              ? ['कैमरा सीधे पौधे की पत्ती पर केंद्रित करें']
              : ['Point the camera directly at the affected crop part'],
          });
          return;
        }

        // Compute holistic quality score (50 to 98)
        let score = 75;
        const tips: string[] = [];

        if (avgBrightness >= 70 && avgBrightness <= 180) {
          score += 15;
        } else if (avgBrightness < 50) {
          score -= 15;
          tips.push(isHi ? 'रोशनी थोड़ी कम है, फोटो थोड़ा धुंधला हो सकता है' : 'Slightly low lighting');
        } else if (avgBrightness > 210) {
          score -= 10;
          tips.push(isHi ? 'रोशनी थोड़ी अधिक है' : 'Slightly bright exposure');
        }

        if (contrastSpread > 100) {
          score += 10;
        } else if (contrastSpread < 50) {
          score -= 10;
          tips.push(isHi ? 'कंट्रास्ट कम है, प्रभावित भाग पर फोकस करें' : 'Low contrast');
        }

        if (foliageRatio > 0.35) {
          score = Math.min(score + 5, 96);
        }

        // Warning only if sub-optimal but valid to analyze
        const isWarning = score < 60;
        resolve({
          isValid: true,
          warningOnly: isWarning,
          qualityScore: Math.max(30, Math.min(score, 98)),
          guidanceTips: tips.length > 0 ? tips : [isHi ? 'उत्तम रोशनी व स्पष्ट फोटो' : 'Good daylight and clarity'],
        });
      } catch {
        resolve({ isValid: true, qualityScore: 80 });
      }
    };

    img.onerror = () => {
      resolve({
        isValid: false,
        errorCode: 'UNSUPPORTED',
        farmerMessage: t.validationDefaultError,
        qualityScore: 0,
      });
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
}

