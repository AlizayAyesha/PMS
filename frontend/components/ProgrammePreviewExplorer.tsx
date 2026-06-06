'use client';

import * as React from 'react';
import Image from 'next/image';
import { FileText, Maximize2, PlayCircle, Presentation } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type {
  ProgrammeInfographicHero,
  ProgrammeInlineSection,
  ProgrammePreviewContent,
  ProgrammePreviewPanel,
} from '@/lib/pathway-programme-preview';

const PANEL_ICON = {
  pdf: FileText,
  slides: Presentation,
  video: PlayCircle,
} as const;

const MATERIAL_FULLSCREEN_DIALOG_CLASS = cn(
  'z-[120] flex max-h-[100dvh] max-w-[100vw] flex-col gap-0 rounded-none border-0 bg-slate-950 p-0 shadow-none',
  'h-[100dvh] w-[100vw] sm:max-w-[100vw]',
  'top-0 left-0 translate-x-0 translate-y-0',
  'data-open:zoom-in-100 data-closed:zoom-out-100',
  '[&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:hover:bg-white/10',
);

function panelSupportsFullscreen(panel: ProgrammePreviewPanel): boolean {
  if (!panel.available) return false;
  if (panel.kind === 'video') return !!(panel.videoSrc || panel.videoEmbedUrl);
  if (panel.kind === 'pdf') return !!panel.pdfSrc;
  if (panel.kind === 'slides') return !!panel.slidesPdfSrc;
  return false;
}

function MaterialFullscreenDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className={MATERIAL_FULLSCREEN_DIALOG_CLASS}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {description ? <DialogDescription className="sr-only">{description}</DialogDescription> : null}
        <div className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
          <p className="text-sm font-bold text-white pr-10">{title}</p>
          {description ? <p className="mt-0.5 text-xs font-medium text-slate-400">{description}</p> : null}
        </div>
        <DialogBody className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">{children}</DialogBody>
        <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs font-medium text-slate-500">
          Press Esc or close to return
        </p>
      </DialogContent>
    </Dialog>
  );
}

function InlineSections({ sections }: { sections: ProgrammeInlineSection[] }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      {sections.map((section) => (
        <div key={section.heading}>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-2">
            {section.heading}
          </p>
          <ul className="space-y-1.5">
            {section.bullets.map((bullet) => (
              <li
                key={bullet}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed pl-3 relative before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-brand-orange"
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function EmbeddedPdf({
  src,
  title,
  variant = 'inline',
}: {
  src: string;
  title: string;
  variant?: 'inline' | 'fullscreen';
}) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
        variant === 'fullscreen' && 'h-full border-white/10 bg-white',
      )}
    >
      <iframe
        title={title}
        src={`${src}#toolbar=0&navpanes=0`}
        className={cn(
          'w-full',
          variant === 'inline' ? 'h-[min(28rem,55vh)]' : 'min-h-[min(calc(100dvh-11rem),56rem)] flex-1',
        )}
      />
    </div>
  );
}

function PanelBody({
  panel,
  variant = 'inline',
}: {
  panel: ProgrammePreviewPanel;
  variant?: 'inline' | 'fullscreen';
}) {
  if (!panel.available) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium py-2">
        Preview for this section is being prepared.
      </p>
    );
  }

  if (panel.kind === 'video') {
    const videoShellClass = cn(
      'overflow-hidden rounded-xl bg-slate-950',
      variant === 'inline' ? 'aspect-video' : 'flex min-h-0 flex-1 items-center justify-center',
    );
    const videoClass =
      variant === 'inline'
        ? 'h-full w-full object-contain'
        : 'max-h-[min(calc(100dvh-11rem),56rem)] w-full object-contain';

    if (panel.videoEmbedUrl) {
      return (
        <div className={videoShellClass}>
          <iframe
            title={panel.videoTitle ?? panel.title}
            src={panel.videoEmbedUrl}
            className={cn('w-full', variant === 'fullscreen' ? 'min-h-[min(calc(100dvh-11rem),56rem)]' : 'h-full')}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    if (panel.videoSrc) {
      return (
        <div className={videoShellClass}>
          <video
            className={videoClass}
            controls
            playsInline
            preload="metadata"
            title={panel.videoTitle ?? panel.title}
          >
            <source src={panel.videoSrc} type="video/mp4" />
          </video>
        </div>
      );
    }
  }

  if (panel.kind === 'pdf') {
    if (panel.pdfSrc) {
      return <EmbeddedPdf src={panel.pdfSrc} title={panel.title} variant={variant} />;
    }
    if (panel.inlineSections?.length) {
      return <InlineSections sections={panel.inlineSections} />;
    }
  }

  if (panel.kind === 'slides') {
    if (panel.slidesPdfSrc) {
      return <EmbeddedPdf src={panel.slidesPdfSrc} title={panel.title} variant={variant} />;
    }
    if (panel.inlineSections?.length) {
      return <InlineSections sections={panel.inlineSections} />;
    }
  }

  return null;
}

function InfographicHero({ hero }: { hero: ProgrammeInfographicHero }) {
  const [fullscreenOpen, setFullscreenOpen] = React.useState(false);

  if (hero.imageSrc) {
    return (
      <>
        <figure className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setFullscreenOpen(true)}
            className="group relative block w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-inset"
            aria-label={`Expand ${hero.title} to fullscreen`}
          >
            <Image
              src={hero.imageSrc}
              alt={hero.title}
              width={1600}
              height={900}
              className="w-full h-auto object-contain"
              priority
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/75 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Click to enlarge
            </span>
          </button>
          <figcaption className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{hero.title}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {hero.subtitle}
              <span className="text-slate-400 dark:text-slate-500"> · Tap the map to view fullscreen</span>
            </p>
          </figcaption>
        </figure>

        <MaterialFullscreenDialog
          open={fullscreenOpen}
          onOpenChange={setFullscreenOpen}
          title={hero.title}
          description={hero.subtitle}
        >
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
            <Image
              src={hero.imageSrc}
              alt={hero.title}
              width={1600}
              height={900}
              quality={95}
              sizes="100vw"
              className="h-auto max-h-[min(calc(100dvh-11rem),900px)] w-full max-w-[min(96vw,1600px)] object-contain"
            />
          </div>
        </MaterialFullscreenDialog>
      </>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-orange/20 bg-gradient-to-br from-brand-orange/5 via-white to-brand-purple/5 dark:from-brand-orange/10 dark:via-slate-900 dark:to-brand-purple/10 p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-1">Pathway map</p>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{hero.title}</h3>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">{hero.subtitle}</p>
      <ol className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hero.steps.map((step, index) => (
          <li
            key={step.label}
            className="flex gap-3 rounded-xl border border-slate-100 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-950/60"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-orange text-xs font-black text-white">
              {index + 1}
            </span>
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{step.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ProgrammePreviewExplorer({
  preview,
  className,
}: {
  preview: ProgrammePreviewContent;
  className?: string;
}) {
  const [openPanel, setOpenPanel] = React.useState<string | undefined>(undefined);
  const [fullscreenPanelId, setFullscreenPanelId] = React.useState<string | undefined>(undefined);

  const fullscreenPanel = React.useMemo(
    () => preview.panels.find((panel) => panel.id === fullscreenPanelId),
    [preview.panels, fullscreenPanelId],
  );

  const handlePanelChange = React.useCallback(
    (value: string | undefined) => {
      setOpenPanel(value);
      if (!value) {
        setFullscreenPanelId(undefined);
        return;
      }
      const panel = preview.panels.find((item) => item.id === value);
      if (panel && panelSupportsFullscreen(panel)) {
        setFullscreenPanelId(value);
      } else {
        setFullscreenPanelId(undefined);
      }
    },
    [preview.panels],
  );

  return (
    <div className={cn('space-y-5', className)}>
      <InfographicHero hero={preview.infographic} />

      <div>
        <p className="text-label mb-3">Explore materials</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3 -mt-1">
          Tap a section to open it fullscreen — guide, slides, and video stay in this window.
        </p>
        <Accordion
          {...({
            type: 'single',
            collapsible: true,
            value: openPanel,
            onValueChange: (value: unknown) => {
              const next =
                value == null || Array.isArray(value) ? undefined : String(value);
              handlePanelChange(next);
            },
          } as React.ComponentProps<typeof Accordion>)}
          className="w-full rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden"
        >
          {preview.panels.map((panel) => {
            const Icon = PANEL_ICON[panel.kind];
            return (
              <AccordionItem
                key={panel.id}
                value={panel.id}
                className="border-0 px-4 bg-white dark:bg-slate-900 data-open:bg-slate-50/80 dark:data-open:bg-slate-950/50"
              >
                <AccordionTrigger className="py-4 hover:no-underline hover:text-brand-orange">
                  <span className="flex items-center gap-3 text-left">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">
                        {panel.title}
                      </span>
                      <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {panel.description}
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {panelSupportsFullscreen(panel) ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Opens fullscreen for easier reading and playback.
                      </p>
                      <button
                        type="button"
                        onClick={() => setFullscreenPanelId(panel.id)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
                      >
                        <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                        Open fullscreen
                      </button>
                    </div>
                  ) : (
                    <PanelBody panel={panel} variant="inline" />
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {fullscreenPanel && panelSupportsFullscreen(fullscreenPanel) ? (
        <MaterialFullscreenDialog
          open={fullscreenPanelId !== undefined}
          onOpenChange={(open) => {
            if (!open) setFullscreenPanelId(undefined);
          }}
          title={fullscreenPanel.title}
          description={fullscreenPanel.description}
        >
          <PanelBody panel={fullscreenPanel} variant="fullscreen" />
        </MaterialFullscreenDialog>
      ) : null}
    </div>
  );
}
