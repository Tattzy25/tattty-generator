"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid, X, ZoomIn, Wand2, Paintbrush } from "lucide-react";
import { KeyboardEvent, useState } from "react";

export function GalleryGridBlock({ models, onSelectModel }: { models: any[], onSelectModel: (model: any) => void }) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handleNext = () => {
    if (selectedImage !== null && models.length > 0) {
      const currentIndex = models.findIndex((img) => img.id === selectedImage);
      const nextIndex = (currentIndex + 1) % models.length;
      setSelectedImage(models[nextIndex].id);
      onSelectModel(models[nextIndex]);
    }
  };

  const handlePrev = () => {
    if (selectedImage !== null && models.length > 0) {
      const currentIndex = models.findIndex((img) => img.id === selectedImage);
      const prevIndex = (currentIndex - 1 + models.length) % models.length;
      setSelectedImage(models[prevIndex].id);
      onSelectModel(models[prevIndex]);
    }
  };

  const selectedImageData = models.find((img) => img.id === selectedImage);

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    image: any
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedImage(image.id);
      onSelectModel(image);
    }
  };

  return (
    <section className="w-full bg-background px-4 pb-16 pt-0">
      <div className="mx-auto max-w-7xl">
        {/* Gallery Grid */}
        <motion.div
          layout
          className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6"
          role="list"
          aria-label="Gallery items"
        >
          <AnimatePresence mode="popLayout">
            {models.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                role="listitem"
                className="break-inside-avoid"
              >
                <Card
                  className="group relative cursor-pointer overflow-hidden border-none transition-all hover:shadow-2xl rounded-[40px] aspect-square focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  onClick={() => {
                    setSelectedImage(image.id);
                    onSelectModel(image);
                  }}
                  onKeyDown={(event) => handleCardKeyDown(event, image)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${image.model_name}`}
                >
                  <div className="absolute inset-0 w-full h-full m-0 p-0">
                    <motion.img
                      src={image.cover_image || "https://cdn.shopify.com/s/files/1/0649/4155/5787/files/Untitled_design_9.png?v=1777847420"}
                      alt={image.model_name}
                      width={500}
                      height={500}
                      loading={index > 6 ? "lazy" : "eager"}
                      className="absolute inset-0 w-full h-full object-cover m-0 p-0"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm m-0 p-0 px-4 text-center"
                      aria-hidden="true"
                    >
                      <ZoomIn className="mb-2 h-8 w-8 text-[var(--muted-foreground)]" aria-hidden="true" />
                      <h3 className="mb-1 text-center text-lg font-semibold text-[var(--muted-foreground)] uppercase">
                        {image.model_name}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        {(image.tags || []).slice(0, 2).map((tag: string, i: number) => (
                          <Badge key={`${tag}-${i}`} variant="secondary" className="uppercase text-[10px] tracking-wider">{tag}</Badge>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage !== null && selectedImageData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              style={{ perspective: "2000px" }}
              onClick={() => setSelectedImage(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="gallery-dialog-title"
              aria-describedby="gallery-dialog-description"
            >
              {/* Navigation Buttons */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="View previous image"
              >
                <ChevronLeft className="h-8 w-8" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="View next image"
              >
                <ChevronRight className="h-8 w-8" aria-hidden="true" />
              </Button>

              {/* Close Button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-8 top-8 z-50 text-[var(--muted-foreground)] hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                onClick={() => setSelectedImage(null)}
                aria-label="Close gallery dialog"
              >
                <X className="h-8 w-8" aria-hidden="true" />
              </Button>

              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateY: 0 }}
                animate={{ scale: 1, opacity: 1, rotateY: 180 }}
                exit={{ scale: 0.8, opacity: 0, rotateY: 0 }}
                transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl aspect-square md:aspect-video"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front of card (Image) */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <img
                    src={selectedImageData.cover_image}
                    alt={selectedImageData.model_name}
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover"
                  />
                  {/* Image Info Overlay on Front before it flips completely */}
                  <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-3xl font-bold text-white mb-2 uppercase">{selectedImageData.model_name}</h3>
                    <div className="flex gap-2">
                      {(selectedImageData.tags || []).slice(0, 2).map((tag: string, i: number) => (
                        <Badge key={`${tag}-${i}`} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none uppercase tracking-wider text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Back of card (White Empty Canvas) */}
                <div 
                  className="absolute inset-0 w-full h-full bg-[#fcfcfc] rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                  <div className="absolute inset-0 w-full h-full overflow-y-auto p-6 md:p-10 flex flex-col md:flex-row gap-6 z-10">
                     
                     {/* Left Column: Info */}
                     <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col border-b md:border-b-0 md:border-r border-gray-200/50 pb-6 md:pb-0 md:pr-8 min-h-min">
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                          <span className="px-3 py-1 bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm">
                            Model Spec
                          </span>
                          <span className="text-[12px] font-medium tracking-[0.1em] text-gray-500 uppercase truncate">
                            {selectedImageData.artist_name}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-start w-full mb-6 shrink-0">
                          {selectedImageData.model_name?.includes('/') ? (
                            <>
                              <h3 className="text-3xl md:text-4xl text-black leading-tight" style={{ fontFamily: "'Rock Salt', cursive" }}>
                                {selectedImageData.model_name.split('/')[0]}
                              </h3>
                              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-gray-900 leading-none mt-2 break-all" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                                /{selectedImageData.model_name.split('/').slice(1).join('/')}
                              </h3>
                            </>
                          ) : (
                            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-gray-900 leading-tight break-words" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                              {selectedImageData.model_name || ''}
                            </h3>
                          )}
                        </div>

                        <div className="mt-auto shrink-0">
                          <p className="text-gray-500 text-sm leading-relaxed md:max-w-md">
                            {selectedImageData.description}
                          </p>
                        </div>
                     </div>

                     {/* Right Column: Action & Abstract Element */}
                     <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center gap-6 md:gap-8 min-h-min">
                        
                        <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 border border-gray-200 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm">
                          <div className="absolute inset-2 border border-dashed border-gray-300 rounded-full animate-[spin_40s_linear_infinite]"></div>
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full text-white flex items-center justify-center shadow-lg z-10 transition-transform duration-700 hover:scale-110">
                            <Wand2 className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                          </div>
                        </div>

                        <div className="flex flex-col items-center w-full gap-3 shrink-0">
                          <Button 
                            className="w-full max-w-[240px] bg-black hover:bg-gray-800 text-white rounded-xl py-6 md:py-7 text-xs font-bold tracking-[0.2em] uppercase shadow-xl transition-all hover:-translate-y-1 hover:shadow-black/20 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 group flex items-center justify-center gap-2"
                            onClick={() => {
                              setSelectedImage(null);
                              setTimeout(() => {
                                const sheetTrigger = document.querySelector('[data-state="closed"]');
                                if (sheetTrigger instanceof HTMLElement) {
                                  sheetTrigger.click();
                                }
                              }, 150);
                            }}
                          >
                            <Paintbrush className="w-4 h-4 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                            Create Now
                          </Button>
                          <span className="text-[9px] md:text-[10px] font-bold tracking-[0.1em] uppercase text-gray-400 text-center">
                            Launch Studio Environment
                          </span>
                        </div>
                     </div>

                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
