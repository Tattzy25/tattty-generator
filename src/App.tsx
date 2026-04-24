import React, { useState } from 'react';
import { UploadCloud, Share2, Download, X, Wand2, Paintbrush } from 'lucide-react';
import { cn } from './lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { GalleryGridBlock } from './components/uitripled/gallery-grid-block-shadcnui';

export default function App() {
  const [promptText, setPromptText] = useState('');
  const [colorMode, setColorMode] = useState('color');
  const [styleInput, setStyleInput] = useState('');
  const [uploadedRef, setUploadedRef] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');

  const [modelName, setModelName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [triggerWord, setTriggerWord] = useState('');
  const [status, setStatus] = useState<'idle' | 'training' | 'online'>('online');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [models, setModels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    const res = await fetch(`https://d1-start.avi-kay2019.workers.dev/api/models?page=${page}&limit=50`);
    const { data, pagination } = await res.json();
    
    setModels((prev: any[]) => [...prev, ...data]);
    
    if (page === 1 && data.length > 0) {
      const firstModel = data[0];
      setModelName(firstModel.model_name);
      setArtistName(firstModel.artist_name);
      setTriggerWord(firstModel.trigger_word);
      setTags(firstModel.tags);
      setDescription(firstModel.description);
    }
    
    setHasMore(page < pagination.total_pages);
    setPage(prev => prev + 1);
    setIsLoading(false);
  };

  React.useEffect(() => {
    loadMore();
  }, []);

  // Infinite Scroll Listener
  React.useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 200
      ) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, page]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        user_story: promptText,
        artistic_style: styleInput,
        color_prefrence: colorMode
      };

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      // Directly set the raw string output from the server
      setGeneratedImage(JSON.stringify(data));
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareEmbed = async () => {
    if (navigator.share) {
      await navigator.share({
        title: modelName,
        text: 'Embed this generator on your site',
        url: `${window.location.origin}/embed/${modelName.toLowerCase().replace(/\s+/g, '-')}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-start relative pt-10 px-[10px]">
      <div className="w-full max-w-[1400px] pb-24">
        <GalleryGridBlock 
          models={models} 
          onSelectModel={(model) => {
            setModelName(model.model_name);
            setArtistName(model.artist_name);
            setTriggerWord(model.trigger_word);
            setTags(model.tags);
            setDescription(model.description);
          }} 
        />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed top-1/2 right-0 -translate-y-1/2 bg-black text-white p-4 rounded-l-2xl shadow-2xl hover:bg-gray-900 transition-all z-50 flex flex-col items-center gap-2 group border-y border-l border-white/20">
             <Paintbrush className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
             <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl' }}>Studio</span>
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="!w-screen !max-w-[100vw] !h-screen p-0 border-none overflow-hidden bg-black/10 backdrop-blur-3xl m-0 rounded-none inset-y-0 right-0 !duration-1000 data-[state=open]:!duration-1000 data-[state=closed]:!duration-1000 transition-all ease-in-out">
          <SheetHeader className="sr-only">
             <SheetTitle>AI Studio</SheetTitle>
             <SheetDescription>Generate art with AI</SheetDescription>
          </SheetHeader>
          <div className="h-full overflow-y-auto py-4 md:py-8 px-[10px] flex items-center justify-center">
            {/* MAIN GENERATOR SECTION */}
            <div className="w-full mx-auto animate-in fade-in duration-500 flex flex-col">
              <div
                style={{ borderColor: '#000000', borderStyle: 'outset', borderWidth: '3px' }}
                className="w-full rounded-[40px] overflow-hidden bg-white shadow-2xl"
              >
                <div className="w-full flex flex-col lg:flex-row items-stretch gap-8 xl:gap-10 p-[10px]">
            {/* LEFT - ARTIST CARD */}
            <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 self-stretch animate-in slide-in-from-left-8 duration-700">
              <div className="h-full">
                <ArtistCard
                  modelName={modelName}
                  artistName={artistName}
                  description={description}
                  tags={tags}
                  status={status}
                  showStars={true}
                />
              </div>
            </div>

            {/* MIDDLE - TRIGGER WORD, PROMPT, UPLOAD */}
            <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col animate-in fade-in duration-700 delay-150 fill-mode-both">
              <div className="w-full flex flex-col gap-4 flex-1">
                {/* Trigger Word */}
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-black mb-2 uppercase text-center">Trigger Word</label>
                  <div className="text-center py-2.5 px-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                    <span className="text-sm font-bold tracking-wider text-black">{triggerWord}</span>
                  </div>
                </div>

                {/* Prompt Input */}
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-black mb-2 uppercase text-center">Describe Your Style</label>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={4}
                    style={{ borderColor: '#000000', borderStyle: 'outset', borderWidth: '3px' }}
                    className="w-full p-3 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-black text-left font-medium placeholder:text-gray-300 bg-transparent resize-none text-sm"
                    placeholder="A cinematic portrait..."
                  />
                </div>

                {/* Color Mode + Style Row */}
                <div className="flex items-center justify-between gap-6">
                  {/* Color Mode */}
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-black uppercase">Color Mode</label>
                    <div className="flex items-center gap-2">
                      {['color', 'black'].map((mode) => (
                        <label key={mode} className={cn(
                          'flex items-center gap-1.5 cursor-pointer px-4 py-2 rounded-full transition-all',
                          colorMode === mode ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        )}>
                          <input
                            type="radio"
                            name="colorMode"
                            value={mode}
                            checked={colorMode === mode}
                            onChange={() => setColorMode(mode)}
                            className="sr-only"
                          />
                          <span className="text-[10px] font-bold tracking-wider uppercase">{mode === 'black' ? 'B&W' : 'Color'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Style Input */}
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-black uppercase">Style</label>
                    <input
                      type="text"
                      value={styleInput}
                      onChange={(e) => setStyleInput(e.target.value)}
                      style={{ borderColor: '#000000', borderStyle: 'outset', borderWidth: '3px' }}
                      className="w-44 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-black text-xs font-medium placeholder:text-gray-300 bg-transparent"
                      placeholder="e.g. cinematic"
                    />
                  </div>
                </div>

                {/* Upload Reference */}
                {uploadedRef ? (
                  <div
                    className="w-full min-h-[110px] rounded-3xl p-4 flex flex-col items-center justify-center bg-transparent text-center"
                    style={{ borderColor: '#000000', borderStyle: 'outset', borderWidth: '3px' }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src={URL.createObjectURL(uploadedRef)} alt="Reference" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-bold text-xs tracking-wider uppercase text-black truncate">{uploadedRef.name}</div>
                        <div className="text-[10px] text-green-600 uppercase tracking-wider font-bold">Image Ready</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedRef(null)}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => document.getElementById('upload-input')?.click()}
                    className="w-full h-[110px] rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-transparent text-center hover:bg-gray-200/30"
                    style={{ borderColor: '#000000', borderStyle: 'outset', borderWidth: '3px' }}
                  >
                    <UploadCloud className="w-8 h-8 mb-1 text-gray-400" />
                    <div className="font-bold text-xs tracking-[0.2em] uppercase text-black">REFERENCE IMAGE</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">.PNG, .JPG, .WEBP</div>
                  </button>
                )}
                <input id="upload-input" type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadedRef(e.target.files[0]);
                  }
                }} />

                {/* Spacer */}
                <div className="flex-1" />

                {/* CREATE BUTTON */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-black text-white rounded-xl py-4 font-bold text-[10px] tracking-[0.25em] uppercase hover:bg-gray-900 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  {isGenerating ? 'CREATING...' : 'CREATE MY IMAGE'}
                </button>
              </div>
            </div>

            {/* RIGHT - RENDERS */}
            <div className="w-full lg:flex-1 animate-in slide-in-from-right-8 duration-700 delay-300 fill-mode-both">
              <div className="w-full flex flex-col h-full">
                <div className="w-full flex flex-col h-[500px]">
                  {/* Action Icons */}
                  <div className={cn(
                    "flex items-center justify-center gap-3 transition-all duration-300",
                    generatedImage ? "h-12 mb-2" : "h-0 mb-0 overflow-hidden"
                  )}>
                    {generatedImage && (
                      <>
                        {/* Save to Profile */}
                        <button
                          className="group relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-500"
                          title="Save to Profile"
                          onClick={() => {}}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Save to Profile</span>
                        </button>
                        {/* Download */}
                        <button
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = generatedImage;
                            a.download = 'generated-image.png';
                            a.click();
                          }}
                          className="group relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
                          title="Download"
                        >
                          <Download className="w-6 h-6" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Download</span>
                        </button>
                        {/* Share */}
                        <button
                          onClick={handleShareEmbed}
                          className="group relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
                          title="Share"
                        >
                          <Share2 className="w-6 h-6" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Share</span>
                        </button>
                        {/* Upload to Community Gallery */}
                        <button
                          className="group relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
                          title="Upload to Community Gallery"
                          onClick={() => {}}
                        >
                          <UploadCloud className="w-6 h-6" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Upload to Gallery</span>
                        </button>
                      </>
                    )}
                  </div>
                  {/* Image / Placeholder */}
                  <div className="flex-1 min-h-0 flex flex-col items-center">
                    {generatedImage ? (
                      <div className="w-full aspect-square max-h-full rounded-3xl overflow-hidden shadow-lg bg-gray-100">
                        <img src={generatedImage} alt="Generated result" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full aspect-square max-h-full rounded-3xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
                        {isGenerating ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-bold tracking-[0.2em] uppercase text-gray-500">Creating Magic...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <Wand2 className="w-20 h-20 text-gray-200" />
                            <p className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 text-center">Your image here</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Edit Image Button */}
                    {generatedImage && (
                      <button
                        className="mt-3 bg-black text-white rounded-full px-4 py-2.5 font-bold text-[10px] tracking-wider uppercase hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center gap-2"
                        onClick={async () => {
                          try {
                            const response = await fetch(generatedImage);
                            if (response.ok) {
                              const blob = await response.blob();
                              const file = new File([blob], 'generated-image.png', { type: 'image/png' });
                              setUploadedRef(file);
                            } else {
                              const file = new File([''], `${generatedImage}`, { type: 'image/png' });
                              setUploadedRef(file);
                            }
                            setGeneratedImage('');
                          } catch {
                            setGeneratedImage('');
                          }
                        }}
                      >
                        Edit Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ArtistCard({
  modelName,
  artistName,
  tags,
  description,
  status,
  showStars,
}: {
  modelName: string;
  artistName: string;
  tags: string[];
  description: string;
  status: 'idle' | 'training' | 'online';
  showStars?: boolean;
}) {
  const statusLabel = status === 'online' ? 'Online' : status === 'training' ? 'Training' : 'Offline';
  const statusClass =
    status === 'online'
      ? 'bg-green-100 text-green-700'
      : status === 'training'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-gray-100 text-gray-600';

  const visibleTags = (tags || [])
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="w-full max-w-[320px] rounded-[32px] bg-white shadow-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Star Rating */}
        {showStars && (
          <div className="flex items-center justify-center gap-1 pb-2">
            {[1,2,3,4,5].map((star) => (
              <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            ))}
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Model</p>
            <h3 className="text-lg font-black uppercase truncate">{modelName}</h3>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mt-2">Artist</p>
            <p className="text-sm font-black uppercase truncate">{artistName || '—'}</p>
          </div>

          <div className={cn('px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase flex-shrink-0', statusClass)}>
            {statusLabel}
          </div>
        </div>

        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Description</p>
          <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
            {description?.length ? description : '—'}
          </pre>
        </div>
      </div>
    </div>
  );
}