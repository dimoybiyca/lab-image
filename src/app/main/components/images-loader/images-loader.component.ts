import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ImagesClassComponent } from '../images-class/images-class.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ModelService } from '../../services/model-service/model.service';

@Component({
  selector: 'app-images-loader',
  standalone: true,
  imports: [ImagesClassComponent, CardModule, ButtonModule, DividerModule],
  templateUrl: './images-loader.component.html',
  styleUrl: './images-loader.component.scss',
})
export class ImagesLoaderComponent implements OnInit {
  @Output() imagesChanged: EventEmitter<{ src: string; label: string }[]> =
    new EventEmitter();

  private modelService: ModelService = inject(ModelService);
  private id = 0;

  classes: { label: string; id: number }[] = [];
  images: { [key: number]: { src: string; label: string }[] } = {};

  ngOnInit(): void {
    this.onAddClass();
  }

  onAddClass(): void {
    this.classes.push({ label: '', id: this.getDatasetId() });
    this.emitImagesChanged();
  }

  onImagesChange(idx, images: { src: string; label: string }[]): void {
    this.images[idx] = images;

    this.emitImagesChanged();
  }

  getDatasetId(): number {
    return this.id++;
  }

  private emitImagesChanged(): void {
    const images = Object.values(this.images).reduce(
      (acc, val) => acc.concat(val),
      []
    );

    this.modelService.saveImages(images);
    this.imagesChanged.emit(images);
  }
}
