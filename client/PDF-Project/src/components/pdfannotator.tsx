import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';


GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PDFAnnotator({ fileUrl }: { fileUrl: string }){

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const loadPdf = async () => {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        console.log(fileUrl);


        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };
        await page.render(renderContext).promise;
        };

        loadPdf();
    }, [fileUrl]);

    return <canvas ref={canvasRef} className="border shadow-md mx-auto mt-4" />;
        
    
}