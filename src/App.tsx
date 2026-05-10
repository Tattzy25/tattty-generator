import React, { useState, useEffect } from 'react';
import { UploadCloud, Share2, Download, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useModels, ModelData } from './hooks/useModels';

export default function App() {
  const [promptText, setPromptText] = useState('');
  const [colorMode, setColorMode] = useState('color');
  const [numOutputs, setNumOutputs] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);

  const { models, refetch } = useModels();

  const [selectedCarouselIdx, setSelectedCarouselIdx] = useState<number | null>(null);

  const carouselImages = [
    { url: "https://styles.tattty.com/1%20(1).png",                          label: "Black & White" },
    { url: "https://styles.tattty.com/1%20(7).png",                          label: "Black & White" },
    { url: "https://styles.tattty.com/ANIME.png",                            label: "Anime" },
    { url: "https://styles.tattty.com/Cyberpunk-portrait%20(1).png",         label: "Cyberpunk" },
    { url: "https://styles.tattty.com/Realism.png",                          label: "Realism" },
    { url: "https://styles.tattty.com/Untitled%20design%20(3).png",          label: "Portrait" },
    { url: "https://styles.tattty.com/alchemical-etch-portrait.png",         label: "Alchemical Etch" },
    { url: "https://styles.tattty.com/anime-portrait%20(1).png",             label: "Anime Portrait" },
    { url: "https://styles.tattty.com/brutalism-portrait%20(1).png",         label: "Brutalism" },
    { url: "https://styles.tattty.com/brutalism-portrait.png",               label: "Brutalism" },
    { url: "https://styles.tattty.com/chi.jpg",                              label: "Chi" },
    { url: "https://styles.tattty.com/continuous-line-portrait%20(1).png",   label: "Continuous Line" },
    { url: "https://styles.tattty.com/download.png",                         label: "Polka Trash" },
    { url: "https://styles.tattty.com/futuristic-portrait%20(1).png",        label: "Futuristic" },
    { url: "https://styles.tattty.com/heavy-blackwork-portrait.png",         label: "Heavy Blackwork" },
    { url: "https://styles.tattty.com/ignorant-tattoo-portrait%20(1).png",   label: "Ignorant" },
    { url: "https://styles.tattty.com/ignorant-tattoo-portrait%20(2).png",   label: "Ignorant" },
    { url: "https://styles.tattty.com/lofi-comic-portrait.png",              label: "Lofi Comic" },
    { url: "https://styles.tattty.com/out-0%20(33).webp",                    label: "Watercolor" },
    { url: "https://styles.tattty.com/sketchwork-portrait%20(1).png",        label: "Sketchwork" },
  ];

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  const handleGenerateImage = async () => {
    if (!selectedModel) {
      toast.error("No model selected.");
      return;
    }
    if (!selectedModel.gen_id) {
      toast.error("Missing gen_id from database.");
      return;
    }
    if (!promptText.trim()) {
      toast.error("Prompt is required.");
      return;
    }

    setIsGenerating(true);
    try {
      const mcpPayload = {
        jsonrpc: "2.0",
        id: selectedModel.gen_id,
        method: "tools/call",
        params: {
          name: "artists_n_models",
          arguments: {
            artist_prompt: promptText.trim(),
            artist_color: colorMode,
            version: selectedModel.version,
            gen_id: selectedModel.gen_id,
            trigger_word: selectedModel.trigger_word || "",
            num_outputs: parseInt(numOutputs) || 1
          },
        },
      };

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mcpPayload)
      });

      if (!response.ok) {
        throw new Error(`Server connection issue. Please try again.`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error("Unable to complete generation. Please try again.");
      }

      const resultText = data.result?.content?.[0]?.text;

      if (!resultText) {
        throw new Error("Invalid response format from server.");
      }

      let parsedImages: string[] = [];
      try {
        const parsed = JSON.parse(resultText);
        if (Array.isArray(parsed)) {
          parsedImages = parsed;
        } else {
          parsedImages = [resultText];
        }
      } catch {
        const urls = resultText.match(/https?:\/\/[^\s"',]+/g);
        if (urls && urls.length > 0) {
          parsedImages = urls;
        } else {
          parsedImages = [resultText];
        }
      }

      setGeneratedImages(parsedImages);
      toast.success("Image Generated Successfully");

      refetch();
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "System error. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareEmbed = async () => {
    if (navigator.share && selectedModel?.model_name) {
      await navigator.share({
        title: selectedModel.model_name,
        text: 'Embed this generator on your site',
        url: `${window.location.origin}/embed/${selectedModel.model_name.toLowerCase().replace(/\s+/g, '-')}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center py-4 md:py-8 px-[10px]">
      <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-500 flex flex-col">
        <div
          style={{ borderColor: '#000000', borderStyle: 'outset', borderWidth: '3px' }}
          className="w-full rounded-[40px] overflow-hidden bg-white shadow-2xl flex flex-col relative"
        >
          {/* Header */}
          <div className="h-[80px] w-full bg-white flex items-center justify-center border-none shrink-0 px-6 gap-6 text-center overflow-hidden whitespace-nowrap flex-nowrap leading-[0.8] border-b-2 border-black/5 shadow-sm relative">

            {/* Model Name Area */}
            <div className="flex flex-col items-start gap-1 shrink-0">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 leading-[0.8] pb-1">Model</span>
              {selectedModel?.model_name?.includes('/') ? (
                <div className="flex items-baseline gap-0.5">
                  <span
                    className="text-[26px] text-black leading-[0.8]"
                    style={{ fontFamily: "'Rock Salt', cursive" }}
                  >
                    {selectedModel.model_name.split('/')[0]}
                  </span>
                  <span
                    className="text-[32px] font-bold text-gray-800 leading-[0.8] uppercase"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    /{selectedModel.model_name.split('/').slice(1).join('/')}
                  </span>
                </div>
              ) : (
                <span className="text-[32px] font-bold text-gray-800 uppercase shrink-0 leading-[0.8]" style={{ fontFamily: "'Orbitron', sans-serif" }}>{selectedModel?.model_name || 'Select Model'}</span>
              )}
            </div>

            {selectedModel?.artist_name && (
              <>
                <div className="w-[1px] h-10 bg-gray-200 shrink-0"></div>
                <div className="flex flex-col items-start gap-1 shrink-0">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 leading-[0.8] pb-1">Artist</span>
                  <span
                    className="text-[26px] text-black leading-[0.8]"
                    style={{ fontFamily: "'Rock Salt', cursive" }}
                  >
                    {selectedModel.artist_name}
                  </span>
                </div>
              </>
            )}

            {selectedModel?.tags && selectedModel.tags.length > 0 && (
              <>
                <div className="w-[1px] h-10 bg-gray-200 shrink-0"></div>
                <div className="flex flex-col items-start gap-1 shrink-0">
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 leading-[0.8] pb-1">Tags</span>
                  <div className="flex items-center gap-2 shrink-0 flex-nowrap whitespace-nowrap pt-1">
                    {selectedModel.tags.slice(0, 2).map((tag, i) => (
                      <span key={`${tag}-${i}`} className="text-[18px] font-black tracking-widest text-gray-500 uppercase leading-[0.8] px-2 py-0.5 bg-gray-50 rounded border border-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="w-[1px] h-10 bg-gray-200 shrink-0"></div>
            <div className="flex flex-col items-start gap-1 shrink-0">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 leading-[0.8] pb-1">Most Loved</span>
              <div className="flex items-center gap-1 shrink-0 pt-1">
                {[1,2,3,4,5].map((star) => (
                  <svg key={star} className="w-[24px] h-[24px] text-yellow-400 fill-current shrink-0" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col lg:flex-row justify-center items-stretch gap-8 xl:gap-10 p-[10px] h-full relative">

            {/* LEFT - VERTICAL MODEL CAROUSEL */}
            <div className="hidden lg:flex w-[150px] flex-shrink-0 flex-col h-[560px]">
              <div
                className="w-full h-full overflow-y-auto hide-scrollbar flex flex-col gap-6 py-4 items-center"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {[...carouselImages, ...carouselImages, ...carouselImages].map((item, idx) => {
                  const realIdx = idx % carouselImages.length;
                  const isSelected = selectedCarouselIdx === realIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedCarouselIdx(isSelected ? null : realIdx)}
                      className={cn(
                        "w-[150px] flex-shrink-0 rounded-[20px] overflow-hidden border-[3px] transition-colors duration-150 focus-visible:outline-none flex flex-col",
                        isSelected ? "border-black" : "border-transparent"
                      )}
                    >
                      <div className="w-full h-[150px] relative">
                        <img
                          src={item.url}
                          alt={item.label || ""}
                          width={150}
                          height={150}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {item.label && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                            <span className="text-white text-[9px] font-bold tracking-[0.15em] uppercase">{item.label}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MIDDLE - TRIGGER WORD, PROMPT, UPLOAD */}
            <div className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col animate-in fade-in duration-700 delay-150 fill-mode-both">
              <div className="w-full flex flex-col gap-4 flex-1">
                {/* Trigger Word */}
                <div>
                  <div className="block text-[14px] font-bold tracking-[0.2em] text-black mb-2 uppercase text-center">Trigger Word</div>
                  <div className="text-center py-2.5 px-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                    <span className="text-[18px] font-bold tracking-wider text-black">{selectedModel?.trigger_word || 'None'}</span>
                  </div>
                </div>

                {/* Prompt Input */}
                <div>
                  <label htmlFor="promptText" className="block text-[14px] font-bold tracking-[0.2em] text-black mb-2 uppercase text-center">Describe Your Style</label>
                  <textarea
                    id="promptText"
                    name="promptText"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    rows={4}
                    style={{ borderColor: '#000000', borderStyle: 'outset', borderWidth: '3px' }}
                    className="w-full p-3 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all text-black text-left font-medium placeholder:text-gray-300 bg-transparent resize-none text-[18px]"
                    placeholder="A cinematic portrait..."
                  />
                </div>

                {/* Color Mode + Style Row */}
                <div className="flex items-center justify-between gap-6">
                  {/* Color Mode */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-[14px] font-bold tracking-[0.2em] text-black uppercase">Color Mode</div>
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
                          <span className="text-[14px] font-bold tracking-wider uppercase">{mode === 'black' ? 'B&W' : 'Color'}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Number Outputs Input */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-[14px] font-bold tracking-[0.2em] text-black uppercase">Number Outputs</div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <label key={num} className={cn(
                          'flex items-center gap-1.5 cursor-pointer w-10 h-10 justify-center rounded-full transition-all',
                          numOutputs === String(num) ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        )}>
                          <input
                            type="radio"
                            name="numOutputs"
                            value={num}
                            checked={numOutputs === String(num)}
                            onChange={(e) => setNumOutputs(e.target.value)}
                            className="sr-only"
                          />
                          <span className="text-[14px] font-bold">{num}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>


                {/* Spacer */}
                <div className="flex-1" />

                {/* CREATE BUTTON */}
                {selectedModel && (
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !promptText.trim()}
                    className="w-full bg-black text-white rounded-xl py-4 font-bold text-[14px] tracking-[0.25em] uppercase hover:bg-gray-900 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-5 h-5" />
                    {isGenerating ? 'CREATING...' : 'CREATE MY IMAGE'}
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT - RENDERS */}
            <div className="w-full lg:flex-1 animate-in slide-in-from-right-8 duration-700 delay-300 fill-mode-both">
              <div className="w-full flex flex-col h-full">
                <div className="w-full flex flex-col h-[560px]">
                  {/* Action Icons */}
                  <div className={cn(
                    "flex items-center justify-center gap-3 transition-all duration-300",
                    generatedImages.length > 0 ? "h-12 mb-2" : "h-0 mb-0 overflow-hidden"
                  )}>
                    {generatedImages.length > 0 && (
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
                            generatedImages.forEach((img, i) => {
                              const a = document.createElement('a');
                              a.href = img;
                              a.download = `generated-image-${i+1}.png`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            });
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
                    {generatedImages.length > 0 ? (
                      <div className={cn(
                        "w-full aspect-square max-h-full rounded-3xl overflow-hidden shadow-lg bg-gray-100",
                        generatedImages.length > 1 ? "grid gap-2 p-2" : "",
                        generatedImages.length === 2 ? "grid-cols-2" : "",
                        generatedImages.length >= 3 ? "grid-cols-2 grid-rows-2" : ""
                      )}>
                        {generatedImages.length === 1 ? (
                          <img src={generatedImages[0]} alt="Generated result" className="w-full h-full object-cover" />
                        ) : (
                          generatedImages.map((img, i) => (
                            <div key={i} className={cn(
                              "relative overflow-hidden rounded-xl bg-gray-200 w-full h-full",
                              generatedImages.length === 3 && i === 2 ? "col-span-2" : ""
                            )}>
                              <img src={img} alt={`Generated result ${i+1}`} className="w-full h-full object-cover" />
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="w-full aspect-square max-h-full rounded-3xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
                        {isGenerating ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin" />
                            <p className="text-[18px] font-bold tracking-[0.2em] uppercase text-gray-500">Creating Magic...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <Wand2 className="w-20 h-20 text-gray-200" />
                            <p className="text-[16px] font-bold tracking-[0.15em] uppercase text-gray-400 text-center">Your image here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
