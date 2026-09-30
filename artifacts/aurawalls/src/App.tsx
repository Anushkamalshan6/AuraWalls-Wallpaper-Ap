import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  AudioLines,
  Bookmark,
  Check,
  ChevronDown,
  CloudUpload,
  Heart,
  Image as ImageIcon,
  Laptop,
  LoaderCircle,
  Maximize2,
  Monitor,
  Palette,
  Search,
  Smartphone,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '@workspace/replit-auth-web';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListWallpapersQueryKey,
  useCreateWallpaper,
  useListWallpapers,
  useRequestUploadUrl,
} from '@workspace/api-client-react';
import type { WallpaperItem } from '@workspace/api-client-react';

type Category =
  | 'AMOLED Deep Black'
  | 'Cyberpunk Neon'
  | 'Minimalist'
  | 'Anime'
  | 'Nature'
  | 'Abstract 3D'
  | 'Live Looping Visuals';

type Wallpaper = {
  id: string;
  title: string;
  category: Category;
  creator: string;
  image: string;
  resolution: string;
  likes: number;
  color: string;
  swatch: string;
  keywords: string;
  imageUrl?: string;
  live?: boolean;
};

const categories: Category[] = [
  'AMOLED Deep Black',
  'Cyberpunk Neon',
  'Minimalist',
  'Anime',
  'Nature',
  'Abstract 3D',
  'Live Looping Visuals',
];

const sampleWallpapers: Wallpaper[] = [
  { id: 'after-hours', title: 'After Hours', category: 'Cyberpunk Neon', creator: 'Mara Voss', image: 'photo-1519608487953-e999c86e7455', resolution: '4K', likes: 2841, color: 'Violet', swatch: '#8860bd', keywords: 'city night neon skyline purple' },
  { id: 'black-sun', title: 'Black Sun', category: 'AMOLED Deep Black', creator: 'Noah Kim', image: 'photo-1500530855697-b586d89ba3ee', resolution: '4K', likes: 1926, color: 'Midnight', swatch: '#151a20', keywords: 'dark sky mountain night black' },
  { id: 'still-form', title: 'Still Form 02', category: 'Minimalist', creator: 'Studio Morrow', image: 'photo-1500534623283-312aade485b7', resolution: '4K', likes: 1487, color: 'Sand', swatch: '#c8b697', keywords: 'minimal mountain landscape neutral' },
  { id: 'blue-hour', title: 'Blue Hour', category: 'Nature', creator: 'Ari Lane', image: 'photo-1470770841072-f978cf4d019e', resolution: '4K', likes: 2360, color: 'Ocean', swatch: '#537e9a', keywords: 'lake mountain water blue nature' },
  { id: 'dream-fragment', title: 'Dream Fragment', category: 'Anime', creator: 'Yuna Ishikawa', image: 'photo-1518837695005-2083093ee35b', resolution: '4K', likes: 3187, color: 'Coral', swatch: '#e28b78', keywords: 'anime ocean clouds sky dreamy' },
  { id: 'orbital', title: 'Orbital Bloom', category: 'Abstract 3D', creator: 'Niko Sato', image: 'photo-1550684848-fac1c5b4e853', resolution: '4K', likes: 2044, color: 'Lime', swatch: '#a7c850', keywords: 'abstract 3d texture art green' },
  { id: 'soft-focus', title: 'Soft Focus', category: 'Live Looping Visuals', creator: 'Lumen Dept.', image: 'photo-1519608487953-e999c86e7455', resolution: '4K', likes: 1208, color: 'Violet', swatch: '#8860bd', keywords: 'loop ambient moving neon violet', live: true },
  { id: 'quiet-earth', title: 'Quiet Earth', category: 'Nature', creator: 'Lena Weiss', image: 'photo-1441974231531-c6227db76b6e', resolution: '4K', likes: 1742, color: 'Moss', swatch: '#687353', keywords: 'forest green trees nature' },
  { id: 'chrome-tide', title: 'Chrome Tide', category: 'Abstract 3D', creator: 'Alex Aoki', image: 'photo-1518770660439-4636190af475', resolution: '4K', likes: 962, color: 'Silver', swatch: '#9ca1a7', keywords: 'chrome silver metal abstract' },
  { id: 'neon-rain', title: 'Neon Rain', category: 'Cyberpunk Neon', creator: 'Jules Ortega', image: 'photo-1519608487953-e999c86e7455', resolution: '4K', likes: 2511, color: 'Cyan', swatch: '#53aab0', keywords: 'cyberpunk neon city rain cyan' },
  { id: 'paper-moon', title: 'Paper Moon', category: 'Minimalist', creator: 'Studio Morrow', image: 'photo-1470252649378-9c29740c9fa8', resolution: '4K', likes: 1839, color: 'Amber', swatch: '#bd8754', keywords: 'minimal sky sunset moon amber' },
  { id: 'deep-current', title: 'Deep Current', category: 'AMOLED Deep Black', creator: 'Mara Voss', image: 'photo-1518837695005-2083093ee35b', resolution: '4K', likes: 1244, color: 'Ocean', swatch: '#537e9a', keywords: 'deep black ocean dark blue' },
  { id: 'afterimage', title: 'Afterimage', category: 'Anime', creator: 'Yuna Ishikawa', image: 'photo-1500534623283-312aade485b7', resolution: '4K', likes: 2788, color: 'Sand', swatch: '#c8b697', keywords: 'anime cinematic dream landscape' },
  { id: 'slow-orbit', title: 'Slow Orbit', category: 'Live Looping Visuals', creator: 'Lumen Dept.', image: 'photo-1534796636912-3b95b3ab5986', resolution: '4K', likes: 873, color: 'Violet', swatch: '#8860bd', keywords: 'looping night starfield ambient', live: true },
  { id: 'glass-garden', title: 'Glass Garden', category: 'Abstract 3D', creator: 'Niko Sato', image: 'photo-1500530855697-b586d89ba3ee', resolution: '4K', likes: 1137, color: 'Moss', swatch: '#687353', keywords: 'abstract glass forest moss' },
  { id: 'first-light', title: 'First Light', category: 'Nature', creator: 'Ari Lane', image: 'photo-1464822759023-fed622ff2c3b', resolution: '4K', likes: 2219, color: 'Amber', swatch: '#bd8754', keywords: 'mountain sunrise amber nature' },
];

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const maxImageSize = 20 * 1024 * 1024;
const uploadTypeByExtension: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
};

function uploadedWallpaper(item: WallpaperItem): Wallpaper {
  const shades = [
    { color: 'Violet', swatch: '#8860bd' },
    { color: 'Ocean', swatch: '#537e9a' },
    { color: 'Moss', swatch: '#687353' },
    { color: 'Sand', swatch: '#c8b697' },
    { color: 'Amber', swatch: '#bd8754' },
    { color: 'Coral', swatch: '#e28b78' },
  ];
  const shade = shades[item.title.length % shades.length];
  const validCategory = categories.find((category) => category === item.category) ?? 'Abstract 3D';
  return {
    id: `uploaded-${item.id}`,
    title: item.title,
    category: validCategory,
    creator: item.creatorName || 'AuraWalls member',
    image: '',
    imageUrl: item.imageUrl,
    resolution: 'Original',
    likes: 0,
    color: shade.color,
    swatch: shade.swatch,
    keywords: item.tags.join(' '),
  };
}

const palette = [
  { name: 'Midnight', hex: '#151a20' },
  { name: 'Violet', hex: '#8860bd' },
  { name: 'Ocean', hex: '#537e9a' },
  { name: 'Moss', hex: '#687353' },
  { name: 'Sand', hex: '#c8b697' },
  { name: 'Amber', hex: '#bd8754' },
  { name: 'Coral', hex: '#e28b78' },
  { name: 'Silver', hex: '#9ca1a7' },
  { name: 'Lime', hex: '#a7c850' },
  { name: 'Cyan', hex: '#53aab0' },
];

type Aspect = 'phone' | 'desktop' | 'ultrawide';
type Adjustments = { brightness: number; contrast: number; blur: number };
type BatteryNavigator = Navigator & {
  getBattery?: () => Promise<{ level: number; addEventListener: (name: string, fn: () => void) => void }>;
};

function readStorage(key: string): string[] {
  try {
    const value = localStorage.getItem(key);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function App() {
  const { isAuthenticated, login } = useAuth();
  const queryClient = useQueryClient();
  const wallpaperQuery = useListWallpapers();
  const requestUpload = useRequestUploadUrl();
  const createWallpaper = useCreateWallpaper();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [activeNav, setActiveNav] = useState<'Explore' | 'Saved' | 'Liked'>('Explore');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sort, setSort] = useState('curated');
  const [liked, setLiked] = useState<string[]>(() => readStorage('aurawalls-liked'));
  const [saved, setSaved] = useState<string[]>(() => readStorage('aurawalls-saved'));
  const [selected, setSelected] = useState<Wallpaper | null>(null);
  const [aspect, setAspect] = useState<Aspect>('phone');
  const [adjustments, setAdjustments] = useState<Adjustments>({ brightness: 100, contrast: 100, blur: 0 });
  const [soundOn, setSoundOn] = useState(false);
  const [now, setNow] = useState(new Date());
  const [battery, setBattery] = useState(87);
  const [toast, setToast] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<Category | ''>('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadFieldErrors, setUploadFieldErrors] = useState<Record<string, string>>({});
  const audioRef = useRef<{ context: AudioContext; nodes: OscillatorNode[]; gain: GainNode } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const allWallpapers = useMemo(
    () => [...(wallpaperQuery.data ?? []).map(uploadedWallpaper), ...sampleWallpapers],
    [wallpaperQuery.data],
  );

  useEffect(() => {
    try { localStorage.setItem('aurawalls-liked', JSON.stringify(liked)); } catch { /* Storage can be unavailable in private mode. */ }
  }, [liked]);
  useEffect(() => {
    try { localStorage.setItem('aurawalls-saved', JSON.stringify(saved)); } catch { /* Storage can be unavailable in private mode. */ }
  }, [saved]);
  useEffect(() => {
    if (!uploadFile) {
      setUploadPreview('');
      return;
    }
    const url = URL.createObjectURL(uploadFile);
    setUploadPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadFile]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const batteryApi = navigator as BatteryNavigator;
    if (!batteryApi.getBattery) return;
    let active = true;
    void batteryApi.getBattery().then((deviceBattery) => {
      if (!active) return;
      const update = () => setBattery(Math.round(deviceBattery.level * 100));
      update();
      deviceBattery.addEventListener('levelchange', update);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);
  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    if (audioRef.current) {
      audioRef.current.nodes.forEach((node) => node.stop());
      void audioRef.current.context.close();
    }
  }, []);

  const filtered = useMemo(() => {
    let results = allWallpapers.filter((wallpaper) => {
      const matchesCategory = category === 'All' || wallpaper.category === category;
      const matchesColor = !selectedColor || wallpaper.color === selectedColor;
      const matchesQuery = `${wallpaper.title} ${wallpaper.category} ${wallpaper.creator} ${wallpaper.keywords}`.toLowerCase().includes(query.toLowerCase().trim());
      const matchesCollection = activeNav === 'Saved'
        ? saved.includes(wallpaper.id)
        : activeNav === 'Liked'
          ? liked.includes(wallpaper.id)
          : true;
      return matchesCategory && matchesColor && matchesQuery && matchesCollection;
    });
    if (sort === 'popular') results = [...results].sort((a, b) => b.likes + (liked.includes(b.id) ? 1 : 0) - (a.likes + (liked.includes(a.id) ? 1 : 0)));
    if (sort === 'title') results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    return results;
  }, [activeNav, allWallpapers, category, liked, query, saved, selectedColor, sort]);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2500);
  };

  const toggleLiked = (id: string) => {
    setLiked((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
  };
  const toggleSaved = (id: string) => {
    const wasSaved = saved.includes(id);
    setSaved((previous) => wasSaved ? previous.filter((item) => item !== id) : [...previous, id]);
    showToast(wasSaved ? 'Removed from your saved collection' : 'Saved to your collection');
  };

  const toggleAmbient = async () => {
    if (soundOn) {
      if (audioRef.current) {
        audioRef.current.gain.gain.setTargetAtTime(0, audioRef.current.context.currentTime, .18);
        const currentAudio = audioRef.current;
        window.setTimeout(() => {
          currentAudio.nodes.forEach((node) => { try { node.stop(); } catch { /* Already stopped. */ } });
          void currentAudio.context.close();
        }, 700);
        audioRef.current = null;
      }
      setSoundOn(false);
      return;
    }
    try {
      const AudioContextConstructor = window.AudioContext;
      const context = new AudioContextConstructor();
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(.035, context.currentTime + 1.8);
      gain.connect(context.destination);
      const nodes = [110, 164.81, 220].map((frequency, index) => {
        const oscillator = context.createOscillator();
        const individualGain = context.createGain();
        oscillator.type = index === 1 ? 'sine' : 'triangle';
        oscillator.frequency.value = frequency;
        individualGain.gain.value = index === 0 ? .33 : .18;
        oscillator.connect(individualGain);
        individualGain.connect(gain);
        oscillator.start();
        return oscillator;
      });
      audioRef.current = { context, nodes, gain };
      setSoundOn(true);
    } catch {
      showToast('Ambient audio is not available in this browser');
    }
  };

  const setAdjustment = (key: keyof Adjustments, value: number) => {
    setAdjustments((previous) => ({ ...previous, [key]: value }));
  };

  const downloadWallpaper = async () => {
    if (!selected) return;
    const source = imageUrl(selected, 1600);
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const dimensions = aspect === 'phone'
        ? { width: 2160, height: 4680 }
        : aspect === 'desktop'
          ? { width: 3840, height: 2400 }
          : { width: 3840, height: 1646 };
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const context = canvas.getContext('2d');
      if (!context) {
        showToast('Could not prepare this download');
        return;
      }
      context.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) blur(${adjustments.blur * (dimensions.width / 1000)}px)`;
      const imageRatio = image.width / image.height;
      const targetRatio = canvas.width / canvas.height;
      let sx = 0; let sy = 0; let sw = image.width; let sh = image.height;
      if (imageRatio > targetRatio) {
        sw = image.height * targetRatio;
        sx = (image.width - sw) / 2;
      } else {
        sh = image.width / targetRatio;
        sy = (image.height - sh) / 2;
      }
      context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          showToast('Could not prepare this download');
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${selected.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${aspect}-4k.jpg`;
        link.click();
        URL.revokeObjectURL(blobUrl);
        showToast('Your 4K wallpaper is ready');
      }, 'image/jpeg', .94);
    };
    image.onerror = () => {
      showToast('Wallpaper could not be reached. Try again in a moment.');
    };
    image.src = source;
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setSelectedColor(null);
    setActiveNav('Explore');
    setSort('curated');
  };

  const openPreview = (wallpaper: Wallpaper) => {
    setSelected(wallpaper);
    setAspect('phone');
    setAdjustments({ brightness: 100, contrast: 100, blur: 0 });
  };

  const currentTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const currentDate = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const featured = sampleWallpapers[0];
  const imageUrl = (wallpaper: Wallpaper, width = 800) => wallpaper.imageUrl || `https://images.unsplash.com/${wallpaper.image}?auto=format&fit=crop&w=${width}&q=85`;

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadCategory('');
    setUploadTags('');
    setUploadFile(null);
    setUploadProgress(0);
    setUploadError('');
    setUploadFieldErrors({});
  };

  const dismissUpload = () => {
    if (uploadBusy) return;
    setUploadOpen(false);
    resetUploadForm();
  };

  useEffect(() => {
    if (!uploadOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !uploadBusy) dismissUpload();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [uploadOpen, uploadBusy]);

  const beginUpload = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    resetUploadForm();
    setUploadOpen(true);
  };

  const selectUploadFile = (file?: File) => {
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const contentType = file.type || uploadTypeByExtension[extension] || '';
    if (!allowedImageTypes.includes(contentType)) {
      setUploadFile(null);
      setUploadError('Choose a JPEG, PNG, WebP, AVIF, or GIF image.');
      return;
    }
    if (file.size > maxImageSize) {
      setUploadFile(null);
      setUploadError('This image is larger than 20 MB. Choose a smaller file.');
      return;
    }
    setUploadError('');
    setUploadFieldErrors((errors) => ({ ...errors, image: '' }));
    setUploadFile(file);
  };

  const submitUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tags = uploadTags.split(',').map((tag) => tag.trim()).filter(Boolean);
    const errors: Record<string, string> = {};
    if (!uploadTitle.trim()) errors.title = 'Give this atmosphere a title.';
    else if (uploadTitle.trim().length > 80) errors.title = 'Keep the title under 80 characters.';
    if (!uploadCategory) errors.category = 'Choose a category for your wallpaper.';
    if (!tags.length) errors.tags = 'Add at least one tag, separated by commas.';
    else if (tags.length > 12 || tags.some((tag) => tag.length > 32)) errors.tags = 'Use up to 12 tags, each 32 characters or fewer.';
    if (!uploadFile) errors.image = 'Choose an image to continue.';
    setUploadFieldErrors(errors);
    setUploadError('');
    if (Object.keys(errors).length) return;
    if (!uploadFile || !uploadCategory) return;

    const extension = uploadFile.name.split('.').pop()?.toLowerCase() ?? '';
    const contentType = uploadFile.type || uploadTypeByExtension[extension];
    if (!contentType) return;
    setUploadBusy(true);
    setUploadProgress(0);
    try {
      const signedUpload = await requestUpload.mutateAsync({
        data: { name: uploadFile.name, size: uploadFile.size, contentType },
      });
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signedUpload.uploadURL);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.upload.onprogress = (progressEvent) => {
          if (progressEvent.lengthComputable) {
            setUploadProgress(Math.min(99, Math.round((progressEvent.loaded / progressEvent.total) * 100)));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error('The image could not be stored. Please try again.'));
        };
        xhr.onerror = () => reject(new Error('The upload was interrupted. Check your connection and try again.'));
        xhr.onabort = () => reject(new Error('The upload was cancelled.'));
        xhr.send(uploadFile);
      });
      setUploadProgress(100);
      await createWallpaper.mutateAsync({
        data: {
          title: uploadTitle.trim(),
          category: uploadCategory,
          tags,
          objectPath: signedUpload.objectPath,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getListWallpapersQueryKey() });
      await queryClient.refetchQueries({ queryKey: getListWallpapersQueryKey(), type: 'active' });
      setUploadOpen(false);
      resetUploadForm();
      setActiveNav('Explore');
      setCategory('All');
      setSelectedColor(null);
      showToast('Your wallpaper is now part of the collection');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Something went wrong while publishing. Please try again.');
    } finally {
      setUploadBusy(false);
    }
  };

  return (
    <main className="aw-app">
      <div className="aw-wrap">
        <header className="aw-header">
          <a className="aw-brand" href="#top" data-testid="link-brand-home" onClick={() => { setActiveNav('Explore'); clearFilters(); }}>
            <span className="aw-brand-mark"><Sparkles size={17} strokeWidth={2.2} /></span>
            <span className="aw-brand-name">aura<span>walls</span></span>
          </a>
          <nav className="aw-nav" aria-label="Main navigation">
            <button className={activeNav === 'Explore' ? 'active' : ''} data-testid="nav-explore" onClick={() => { setActiveNav('Explore'); setCategory('All'); }}>Explore</button>
            <button className={activeNav === 'Saved' ? 'active' : ''} data-testid="nav-saved" onClick={() => setActiveNav(activeNav === 'Saved' ? 'Explore' : 'Saved')}>Saved <span>{saved.length ? `(${saved.length})` : ''}</span></button>
            <button data-testid="nav-categories" onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}>Categories</button>
          </nav>
          <div className="aw-header-right">
            <button className="aw-header-btn aw-upload-trigger" data-testid="button-admin-upload" onClick={beginUpload}>
              <CloudUpload size={15} /> Admin Upload
            </button>
            <button className="aw-header-btn" data-testid="button-liked-wallpapers" onClick={() => { setActiveNav(activeNav === 'Liked' ? 'Explore' : 'Liked'); setCategory('All'); }} aria-label="Liked wallpapers">
              <Heart size={15} /> {liked.length ? `${liked.length} liked` : 'Likes'}
            </button>
          </div>
        </header>

        <section className="aw-hero" id="top" aria-label="Featured wallpaper">
          <div className="aw-hero-copy-block">
            <div className="aw-eyebrow" data-testid="text-hero-eyebrow">A more personal kind of screen</div>
            <h1 data-testid="text-hero-title">Your screen,<br /><em>your atmosphere.</em></h1>
            <p className="aw-hero-copy" data-testid="text-hero-description">A considered collection of wallpapers for the way you want to feel. Find the one that makes your device feel like yours.</p>
            <div className="aw-hero-actions">
              <button className="aw-primary" data-testid="button-explore-collection" onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}>Explore the collection <ArrowRight size={14} /></button>
              <button className="aw-text-action" data-testid="button-featured-preview" onClick={() => openPreview(featured)}><Maximize2 size={13} /> View featured</button>
            </div>
            <div className="aw-stat-line">
              <div className="aw-stat"><strong data-testid="text-wallpaper-count">{allWallpapers.length}</strong> considered images</div>
              <div className="aw-stat"><strong data-testid="text-resolution">4K</strong> detail, always</div>
              <div className="aw-stat"><strong data-testid="text-free-label">Free</strong> to make yours</div>
            </div>
          </div>
          <div className="aw-hero-visual">
            <img src={imageUrl(featured, 1300)} alt="A cinematic night sky with a deep violet atmosphere" data-testid="img-featured-wallpaper" />
            <div className="aw-feature-copy">
              <div className="aw-feature-tag" data-testid="text-featured-tag">Editor's atmosphere · 01</div>
              <h2 data-testid="text-featured-title">{featured.title}</h2>
              <p data-testid="text-featured-description">When the city becomes a feeling.</p>
            </div>
            <button className="aw-feature-open" data-testid="button-open-featured" aria-label="Preview After Hours wallpaper" onClick={() => openPreview(featured)}><ArrowRight size={17} /></button>
          </div>
        </section>

        <section id="gallery" aria-label="Wallpaper gallery">
          <div className="aw-toolbar">
            <div className="aw-section-title">
              <h2 data-testid="text-gallery-title">{activeNav === 'Saved' ? 'Your saved walls' : activeNav === 'Liked' ? 'Your liked walls' : 'Find your atmosphere'}</h2>
              <span data-testid="text-gallery-count">{filtered.length.toString().padStart(2, '0')} WALLPAPERS</span>
            </div>
            <div className="aw-tools">
              <label className="aw-search">
                <Search size={15} />
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search moods, colors, places..." aria-label="Search wallpapers" data-testid="input-wallpaper-search" />
                {query && <button data-testid="button-clear-search" onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button>}
              </label>
              <label className="aw-sort">
                <ChevronDown size={13} />
                <select aria-label="Sort wallpapers" value={sort} onChange={(event) => setSort(event.target.value)} data-testid="select-wallpaper-sort">
                  <option value="curated">Curated</option>
                  <option value="popular">Popular</option>
                  <option value="title">A — Z</option>
                </select>
              </label>
            </div>
          </div>
          {wallpaperQuery.isLoading && (
            <div className="aw-gallery-state aw-gallery-loading" role="status" data-testid="status-wallpapers-loading">
              <span className="aw-skeleton-line" /><span>Gathering the community collection</span>
            </div>
          )}
          {wallpaperQuery.isError && (
            <div className="aw-gallery-state aw-gallery-error" role="alert" data-testid="status-wallpapers-error">
              <span>Community uploads could not be reached. The curated gallery is still here.</span>
              <button type="button" onClick={() => void wallpaperQuery.refetch()} data-testid="button-retry-wallpapers">Retry</button>
            </div>
          )}
          <div className="aw-categories" role="group" aria-label="Wallpaper categories">
            <button className={`aw-chip ${category === 'All' ? 'selected' : ''}`} onClick={() => setCategory('All')} data-testid="filter-category-all">All walls <span className="aw-chip-count">{allWallpapers.length}</span></button>
            {categories.map((item) => (
              <button key={item} className={`aw-chip ${category === item ? 'selected' : ''}`} onClick={() => setCategory(category === item ? 'All' : item)} data-testid={`filter-category-${item.toLowerCase().replaceAll(' ', '-')}`}>
                {item}<span className="aw-chip-count">{allWallpapers.filter((wallpaper) => wallpaper.category === item).length}</span>
              </button>
            ))}
          </div>
          <div className="aw-filter-row">
            <div className="aw-palette" role="group" aria-label="Filter by color">
              <span className="aw-palette-label"><Palette size={12} /> TONE</span>
              {palette.map((color) => (
                <button
                  key={color.name}
                  className={`aw-swatch ${selectedColor === color.name ? 'selected' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={`Filter ${color.name} wallpapers`}
                  aria-pressed={selectedColor === color.name}
                  data-testid={`filter-color-${color.name.toLowerCase()}`}
                  onClick={() => setSelectedColor(selectedColor === color.name ? null : color.name)}
                />
              ))}
              {selectedColor && <button className="aw-clear" onClick={() => setSelectedColor(null)} data-testid="button-clear-color">Clear tone</button>}
            </div>
            <div className="aw-results-meta" data-testid="text-results-count">{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</div>
          </div>

          <div className="aw-grid" data-testid="wallpaper-gallery">
            {filtered.map((wallpaper, index) => {
              const isLiked = liked.includes(wallpaper.id);
              const isSaved = saved.includes(wallpaper.id);
              return (
                <article className="aw-wall-card" key={wallpaper.id} style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }} data-testid={`card-wallpaper-${wallpaper.id}`}>
                  <div className="aw-image-wrap" role="button" tabIndex={0} aria-label={`Preview ${wallpaper.title}`} onClick={() => openPreview(wallpaper)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openPreview(wallpaper); }}>
                    <img src={imageUrl(wallpaper)} alt={`${wallpaper.title} wallpaper`} loading="lazy" data-testid={`img-wallpaper-${wallpaper.id}`} />
                    <div className="aw-image-top">
                      <span className="aw-tag" data-testid={`text-wallpaper-resolution-${wallpaper.id}`}>{wallpaper.live ? 'Live loop' : wallpaper.resolution}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={`aw-icon-btn ${isLiked ? 'is-on' : ''}`} aria-label={isLiked ? `Unlike ${wallpaper.title}` : `Like ${wallpaper.title}`} aria-pressed={isLiked} data-testid={`button-like-${wallpaper.id}`} onClick={(event) => { event.stopPropagation(); toggleLiked(wallpaper.id); }}>
                          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button className={`aw-icon-btn ${isSaved ? 'is-on' : ''}`} aria-label={isSaved ? `Remove ${wallpaper.title} from saved` : `Save ${wallpaper.title}`} aria-pressed={isSaved} data-testid={`button-save-${wallpaper.id}`} onClick={(event) => { event.stopPropagation(); toggleSaved(wallpaper.id); }}>
                          <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                    <div className="aw-card-bottom">
                      <div>
                        <div className="aw-wall-title" data-testid={`text-wallpaper-title-${wallpaper.id}`}>{wallpaper.title}</div>
                        <div className="aw-wall-sub" data-testid={`text-wallpaper-creator-${wallpaper.id}`}>by {wallpaper.creator}</div>
                      </div>
                      <div className="aw-card-meta" data-testid={`text-wallpaper-likes-${wallpaper.id}`}><Heart size={10} /> {wallpaper.likes.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="aw-card-info">
                    <span data-testid={`text-wallpaper-category-${wallpaper.id}`}>{wallpaper.category}</span>
                    <span data-testid={`text-wallpaper-color-${wallpaper.id}`}><i className="aw-color-dot" style={{ backgroundColor: wallpaper.swatch }} />{wallpaper.color}</span>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 && (
              <div className="aw-empty" data-testid="empty-wallpaper-results">
                <ImageIcon size={23} />
                <strong data-testid="text-empty-title">{activeNav === 'Saved' ? 'Your collection is waiting.' : activeNav === 'Liked' ? 'Your favorites start here.' : 'Nothing in this atmosphere yet.'}</strong>
                <p data-testid="text-empty-description">{activeNav === 'Saved' ? 'Save a wallpaper and it will find a home here.' : activeNav === 'Liked' ? 'Like a wallpaper and return to it whenever you want.' : 'Try another color, category, or search.'}</p>
                <button className="aw-primary" onClick={clearFilters} data-testid="button-reset-filters">Reset filters <ArrowRight size={13} /></button>
              </div>
            )}
          </div>
        </section>
        <footer className="aw-footer">
          <span data-testid="text-footer-brand"><b>AURAWALLS</b> · A quieter kind of screen</span>
          <span data-testid="text-footer-note">Made for the spaces between things.</span>
          <span data-testid="text-footer-copyright">© 2025 AuraWalls Studio</span>
        </footer>
      </div>

      {uploadOpen && (
        <div
          className="aw-modal-backdrop aw-upload-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) dismissUpload();
          }}
          data-testid="admin-upload-overlay"
        >
          <section className="aw-upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title" data-testid="admin-upload-modal">
            <div className="aw-upload-art">
              {uploadPreview ? (
                <img src={uploadPreview} alt="Selected wallpaper preview" data-testid="img-upload-preview" />
              ) : (
                <div className="aw-upload-art-empty">
                  <span className="aw-upload-art-mark"><ImageIcon size={21} /></span>
                  <span>Make room for a new atmosphere</span>
                  <small>Your original, in the gallery</small>
                </div>
              )}
              <div className="aw-upload-art-caption">
                <span>COMMUNITY WALLPAPER</span>
                <strong>{uploadTitle.trim() || 'A new point of view'}</strong>
              </div>
            </div>
            <div className="aw-upload-form-panel">
              <div className="aw-upload-heading">
                <div>
                  <div className="aw-modal-kicker">Share a frame</div>
                  <h2 id="upload-title">Admin Upload</h2>
                  <p>Add an original wallpaper to the AuraWalls collection.</p>
                </div>
                <button
                  className="aw-close"
                  type="button"
                  aria-label="Close upload form"
                  disabled={uploadBusy}
                  onClick={dismissUpload}
                  data-testid="button-close-upload"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="aw-modal-rule" />
              <form className="aw-upload-form" onSubmit={(event) => void submitUpload(event)} noValidate>
                <div className="aw-form-field">
                  <label htmlFor="upload-wallpaper-title">Title <span>Required</span></label>
                  <input
                    id="upload-wallpaper-title"
                    type="text"
                    value={uploadTitle}
                    maxLength={80}
                    placeholder="Name this atmosphere"
                    onChange={(event) => {
                      setUploadTitle(event.target.value);
                      setUploadFieldErrors((errors) => ({ ...errors, title: '' }));
                    }}
                    aria-invalid={Boolean(uploadFieldErrors.title)}
                    data-testid="input-upload-title"
                  />
                  {uploadFieldErrors.title && <small className="aw-field-error" data-testid="error-upload-title">{uploadFieldErrors.title}</small>}
                </div>
                <div className="aw-form-field">
                  <label htmlFor="upload-wallpaper-category">Category <span>Required</span></label>
                  <select
                    id="upload-wallpaper-category"
                    value={uploadCategory}
                    onChange={(event) => {
                      setUploadCategory(event.target.value as Category | '');
                      setUploadFieldErrors((errors) => ({ ...errors, category: '' }));
                    }}
                    aria-invalid={Boolean(uploadFieldErrors.category)}
                    data-testid="select-upload-category"
                  >
                    <option value="">Choose a category</option>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  {uploadFieldErrors.category && <small className="aw-field-error" data-testid="error-upload-category">{uploadFieldErrors.category}</small>}
                </div>
                <div className="aw-form-field">
                  <label htmlFor="upload-wallpaper-tags">Tags <span>Separate with commas</span></label>
                  <input
                    id="upload-wallpaper-tags"
                    type="text"
                    value={uploadTags}
                    placeholder="e.g. dusk, grain, quiet"
                    onChange={(event) => {
                      setUploadTags(event.target.value);
                      setUploadFieldErrors((errors) => ({ ...errors, tags: '' }));
                    }}
                    aria-invalid={Boolean(uploadFieldErrors.tags)}
                    data-testid="input-upload-tags"
                  />
                  {uploadFieldErrors.tags && <small className="aw-field-error" data-testid="error-upload-tags">{uploadFieldErrors.tags}</small>}
                </div>
                <div className="aw-form-field">
                  <div className="aw-file-label-row">
                    <label htmlFor="upload-wallpaper-image">Original image <span>Up to 20 MB</span></label>
                    {uploadFile && <span className="aw-file-size" data-testid="text-upload-file-size">{(uploadFile.size / (1024 * 1024)).toFixed(1)} MB</span>}
                  </div>
                  <div className="aw-file-drop-row">
                    <label className={`aw-file-drop ${uploadFile ? 'has-file' : ''}`} htmlFor="upload-wallpaper-image" data-testid="label-upload-image">
                      <input
                        id="upload-wallpaper-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                        disabled={uploadBusy}
                        onChange={(event) => {
                          selectUploadFile(event.target.files?.[0]);
                          event.currentTarget.value = '';
                        }}
                        data-testid="input-upload-image"
                      />
                      <span className="aw-file-icon"><Upload size={15} /></span>
                      <span className="aw-file-copy">
                        <strong>{uploadFile ? uploadFile.name : 'Choose an image from your device'}</strong>
                        <small>{uploadFile ? 'Select another file to replace it' : 'JPEG, PNG, WebP, AVIF, or GIF'}</small>
                      </span>
                    </label>
                    {uploadFile && (
                      <button
                        className="aw-remove-file"
                        type="button"
                        disabled={uploadBusy}
                        aria-label="Remove selected image"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setUploadFile(null);
                          setUploadError('');
                        }}
                        data-testid="button-remove-upload-image"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {uploadFieldErrors.image && <small className="aw-field-error" data-testid="error-upload-image">{uploadFieldErrors.image}</small>}
                </div>
                {uploadBusy && (
                  <div className="aw-upload-progress" role="status" aria-live="polite" data-testid="status-upload-progress">
                    <div className="aw-upload-progress-label">
                      <span>{uploadProgress >= 100 ? 'Publishing to the collection' : 'Uploading your original'}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="aw-progress-track" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ transform: `scaleX(${uploadProgress / 100})` }} />
                    </div>
                  </div>
                )}
                {uploadError && <div className="aw-upload-error" role="alert" data-testid="error-upload-submit">{uploadError}</div>}
                <div className="aw-upload-footer">
                  <span><CloudUpload size={13} /> Shared across devices</span>
                  <button className="aw-primary aw-publish-button" type="submit" disabled={uploadBusy} data-testid="button-publish-wallpaper">
                    {uploadBusy ? <><LoaderCircle size={14} className="aw-spinning" /> Publishing</> : <>Publish wallpaper <ArrowRight size={14} /></>}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
      {selected && (
        <div className="aw-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }} data-testid="wallpaper-preview-overlay">
          <section className="aw-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title" data-testid="wallpaper-preview-modal">
            <div className="aw-preview-stage">
              <div className="aw-preview-glow" />
              <div className={`aw-device ${aspect} ${selected.live ? 'live-loop' : ''}`} data-testid="preview-device-frame">
                <img
                  src={imageUrl(selected, 1600)}
                  alt={`${selected.title} live wallpaper preview`}
                  style={{ filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) blur(${adjustments.blur}px)` }}
                  data-testid="img-preview-wallpaper"
                />
                {aspect === 'phone' && (
                  <>
                    <div className="aw-device-status"><span>9:41</span><span>● ▮▮ {battery}%</span></div>
                    <div className="aw-device-widget">
                      <time data-testid="text-preview-clock">{currentTime}</time>
                      <span data-testid="text-preview-date">{currentDate}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="aw-preview-panel">
              <div className="aw-modal-head">
                <div>
                  <div className="aw-modal-kicker" data-testid="text-preview-category">AuraWalls · {selected.category}</div>
                  <h2 id="preview-title" data-testid="text-preview-title">{selected.title}</h2>
                  <p data-testid="text-preview-creator">A frame by {selected.creator} · {selected.resolution} detail</p>
                </div>
                <button className="aw-close" aria-label="Close preview" onClick={() => setSelected(null)} data-testid="button-close-preview"><X size={17} /></button>
              </div>
              <div className="aw-modal-rule" />
              <div className="aw-control-label"><span>Preview for</span><span>DEVICE FORMAT</span></div>
              <div className="aw-aspect-options" role="group" aria-label="Preview aspect ratio">
                <button className={`aw-option ${aspect === 'phone' ? 'selected' : ''}`} onClick={() => setAspect('phone')} data-testid="option-aspect-phone"><Smartphone size={13} /> Mobile</button>
                <button className={`aw-option ${aspect === 'desktop' ? 'selected' : ''}`} onClick={() => setAspect('desktop')} data-testid="option-aspect-desktop"><Monitor size={13} /> Desktop</button>
                <button className={`aw-option ${aspect === 'ultrawide' ? 'selected' : ''}`} onClick={() => setAspect('ultrawide')} data-testid="option-aspect-ultrawide"><Laptop size={13} /> Ultra-wide</button>
              </div>
              <div className="aw-sliders">
                <div className="aw-slider">
                  <label htmlFor="brightness-slider">Brightness <span data-testid="value-brightness">{adjustments.brightness}%</span></label>
                  <input id="brightness-slider" type="range" min="50" max="150" value={adjustments.brightness} onChange={(event) => setAdjustment('brightness', Number(event.target.value))} data-testid="slider-brightness" />
                </div>
                <div className="aw-slider">
                  <label htmlFor="contrast-slider">Contrast <span data-testid="value-contrast">{adjustments.contrast}%</span></label>
                  <input id="contrast-slider" type="range" min="50" max="150" value={adjustments.contrast} onChange={(event) => setAdjustment('contrast', Number(event.target.value))} data-testid="slider-contrast" />
                </div>
                <div className="aw-slider">
                  <label htmlFor="blur-slider">Soft focus <span data-testid="value-blur">{adjustments.blur}px</span></label>
                  <input id="blur-slider" type="range" min="0" max="8" value={adjustments.blur} onChange={(event) => setAdjustment('blur', Number(event.target.value))} data-testid="slider-blur" />
                </div>
              </div>
              <div className="aw-modal-rule" />
              <button className={`aw-audio-toggle ${soundOn ? 'on' : ''}`} aria-pressed={soundOn} onClick={() => void toggleAmbient()} data-testid="toggle-ambient-sound">
                <span className="aw-audio-left"><span className="aw-audio-icon"><AudioLines size={15} /></span><span><b style={{ display: 'block', color: '#e0e0db', fontWeight: 600, marginBottom: 3 }}>Matching atmosphere</b>Ambient soundscape</span></span>
                <span className="aw-toggle-track" />
              </button>
              <p className="aw-audio-note" data-testid="text-audio-description">A soft, generative drone made in your browser. No audio files, no uploads.</p>
              <div className="aw-modal-actions">
                <button className="aw-primary aw-download" onClick={() => void downloadWallpaper()} data-testid="button-download-wallpaper"><ArrowDownToLine size={15} /> Download 4K</button>
                <button className={`aw-save ${saved.includes(selected.id) ? 'is-on' : ''}`} aria-label={saved.includes(selected.id) ? 'Remove from saved' : 'Save wallpaper'} aria-pressed={saved.includes(selected.id)} onClick={() => toggleSaved(selected.id)} data-testid="button-save-preview"><Bookmark size={16} fill={saved.includes(selected.id) ? 'currentColor' : 'none'} /></button>
              </div>
              <div className="aw-download-note" data-testid="text-download-details">Optimized for {aspect === 'phone' ? 'mobile' : aspect === 'desktop' ? 'desktop' : 'ultra-wide'} · Adjustments included in your download</div>
            </div>
          </section>
        </div>
      )}
      {toast && <div role="status" className="aw-toast" data-testid="status-toast"><Check size={15} />{toast}</div>}
    </main>
  );
}

export default App;