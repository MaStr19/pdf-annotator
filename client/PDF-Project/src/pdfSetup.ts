import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';


GlobalWorkerOptions.workerSrc = pdfjsWorker;
