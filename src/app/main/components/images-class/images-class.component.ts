import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-images-class',
  standalone: true,
  imports: [
    FileUploadModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ButtonModule,
    DecimalPipe,
  ],
  templateUrl: './images-class.component.html',
  styleUrl: './images-class.component.scss',
})
export class ImagesClassComponent {
  @Output() datasetDelete: EventEmitter<void> = new EventEmitter();
  @Output() imagesChanged: EventEmitter<any> = new EventEmitter();
  @Input() idx: number = 0;

  files: any[] = [];
  className: string = '';

  onFilesSelected($event: Event): void {
    const input = $event.target as HTMLInputElement;

    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.files.push({
            src: e.target.result,
            name: $event.target['files'][i].name,
            size: $event.target['files'][i].size,
          });

          this.emitImagesChanged();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onDeleteImage(idx: number): void {
    this.files.splice(idx, 1);
    this.emitImagesChanged();
  }

  onLabelChange(): void {
    if (!this.files.length) {
      return;
    }

    this.emitImagesChanged();
  }

  onDatasetDelete(idx: number): void {
    this.datasetDelete.next();
  }

  private emitImagesChanged(): void {
    this.imagesChanged.emit(
      this.files.map((file) => ({
        src: file.src,
        label: this.className,
      }))
    );
  }
}
