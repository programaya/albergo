<file-drag-drop
        [multiple]="true"
        [accept]="'image/*,.pdf,.doc,.docx'"
        [allowedTypes]="['image', 'pdf', 'document']"
        [maxSize]="5 * 1024 * 1024"
        [maxFiles]="5"
        title="Arrastra y suelta tus archivos aquí"
        subtitle="Imágenes, PDF o documentos permitidos"
        (filesSelected)="onFilesSelected($event)"
        (fileRemoved)="onFileRemoved($event)"
        (error)="onError($event)">
</file-drag-drop>