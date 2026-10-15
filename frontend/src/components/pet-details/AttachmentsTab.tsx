import { useState } from 'react';
import { UploadCloud, Loader2, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { type ClinicalAttachment } from '../../lib/api';
import { AttachmentThumbnail } from './AttachmentThumbnail';

interface AttachmentsTabProps {
  attachments: ClinicalAttachment[];
  attachmentsLoading: boolean;
  uploadProgress: number | null;
  onUploadFiles: (files: FileList) => void;
  onOpenPreview: (att: ClinicalAttachment) => void;
  onDownloadAttachment: (att: ClinicalAttachment) => void;
  onDeleteAttachment: (id: string, name: string) => void;
  formatDisplayDate: (dateStr: string, includeTime?: boolean) => string;
}

export function AttachmentsTab({
  attachments,
  attachmentsLoading,
  uploadProgress,
  onUploadFiles,
  onOpenPreview,
  onDownloadAttachment,
  onDeleteAttachment,
  formatDisplayDate,
}: AttachmentsTabProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Dropzone de Upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            onUploadFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => document.getElementById('file-upload-input')?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
        }`}
      >
        <input
          id="file-upload-input"
          type="file"
          accept=".pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => {
            if (e.target.files) {
              onUploadFiles(e.target.files);
            }
          }}
          className="hidden"
        />

        <UploadCloud
          className={`h-12 w-12 text-primary transition-transform duration-300 ${
            isDragging ? 'scale-110 -translate-y-1' : ''
          }`}
        />
        <h3 className="mt-4 text-base font-bold text-foreground">
          Arraste e solte arquivos aqui, ou clique para fazer upload
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground font-semibold">
          Apenas arquivos PDF, PNG, JPG/JPEG e WEBP até 10 MB são aceitos.
        </p>

        {uploadProgress !== null && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-background/90 rounded-b-2xl flex flex-col space-y-2 border-t border-border animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Fazendo upload do arquivo...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de Anexos */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Arquivos Anexados
        </h3>

        {attachmentsLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-16 w-full rounded-xl bg-card" />
            <Skeleton className="h-16 w-full rounded-xl bg-card" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 border border-dashed border-border rounded-2xl p-6">
            <FileText className="h-10 w-10 text-muted-foreground/45 mb-2" />
            <h4 className="text-sm font-bold text-foreground">Nenhum exame ou anexo localizado</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Arraste e solte seus arquivos PDF ou de imagem aqui, ou clique para fazer upload do primeiro anexo deste pet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {attachments.map((att) => {
              const isImage = att.mimeType.startsWith('image/');
              const sizeInMB = (att.fileSize / (1024 * 1024)).toFixed(2);
              const displaySize =
                att.fileSize > 1024 * 1024
                  ? `${sizeInMB} MB`
                  : `${(att.fileSize / 1024).toFixed(1)} KB`;

              return (
                <div
                  key={att.id}
                  className="group/card flex flex-col justify-between bg-card border border-border/80 hover:border-primary/20 hover:shadow-md rounded-2xl p-4 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail do Anexo */}
                    <div
                      className={isImage ? 'cursor-pointer' : ''}
                      onClick={() => isImage && onOpenPreview(att)}
                    >
                      <AttachmentThumbnail att={att} />
                    </div>

                    {/* Detalhes do Anexo */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-col gap-0.5">
                        <h4
                          onClick={() => isImage && onOpenPreview(att)}
                          className={`text-sm font-bold text-foreground truncate select-none leading-snug ${
                            isImage ? 'cursor-pointer hover:text-primary hover:underline' : ''
                          }`}
                          title={att.originalFileName}
                        >
                          {att.originalFileName}
                        </h4>
                        {att.notes && (
                          <p className="text-xs text-muted-foreground/80 font-medium italic line-clamp-2 leading-relaxed">
                            {att.notes}
                          </p>
                        )}
                      </div>

                      {/* Badges de Metadados */}
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border ${
                            att.mimeType === 'application/pdf'
                              ? 'bg-rose-500/5 text-rose-600 border-rose-500/10'
                              : 'bg-indigo-500/5 text-indigo-600 border-indigo-500/10'
                          }`}
                        >
                          {att.mimeType === 'application/pdf' ? 'Documento PDF' : 'IMAGEM'}
                        </span>

                        {att.clinicalRecordId && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-emerald-500/5 text-emerald-600 border border-emerald-500/10">
                            Vínculo Clínico
                          </span>
                        )}
                      </div>

                      {/* Tamanho e Data */}
                      <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground/85 font-semibold">
                        <span className="flex items-center gap-1">{displaySize}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {att.createdAt ? formatDisplayDate(att.createdAt, false) : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <div className="text-[10px] text-muted-foreground/60 font-semibold select-none">
                      {att.mimeType.split('/')[1]?.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      {isImage && (
                        <Button
                          onClick={() => onOpenPreview(att)}
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary px-3 rounded-lg flex items-center gap-1"
                        >
                          Visualizar
                        </Button>
                      )}
                      <Button
                        onClick={() => onDownloadAttachment(att)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        title="Baixar arquivo"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onDeleteAttachment(att.id, att.originalFileName)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        title="Remover anexo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
