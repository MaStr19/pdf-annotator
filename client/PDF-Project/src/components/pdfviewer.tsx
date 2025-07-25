import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';


GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PDFViewer(props: {fileUrl:string, rotation:number, page:number, scale:number}){

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const loadPdf = async () => {
        const loadingTask = pdfjsLib.getDocument(props.fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(props.page);
        console.log(props.fileUrl);

        let rotation :number = props.rotation;
        let scale : number = props.scale;
        const viewport = page.getViewport({ scale: scale, rotation });
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
    }, [props.fileUrl, props.rotation, props.page, props.scale]);

    return <canvas ref={canvasRef} className="border shadow-md mx-auto mt-4" />;
        
    
}