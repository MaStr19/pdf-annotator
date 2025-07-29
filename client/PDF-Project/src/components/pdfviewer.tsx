import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { Canvas } from 'fabric';


GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PDFViewer(props: {
    fileUrl:string, 
    rotation:number, 
    page:number, 
    scale:number,
    fabricCanvas:any
    setFabricCanvas:React.Dispatch<React.SetStateAction<any>>
}){


    const canvasRef = useRef<HTMLCanvasElement>(null);
    const annotationCanvasDomRef = useRef<HTMLCanvasElement>(null);
    const pdfRef = useRef<any | null>(null);
    const [viewport, setViewport] = useState({width: 0, height: 0})
    const annotationCanvasRef = useRef<Canvas | null>(null);


    useEffect(() => {
        const loadPdf = async () => {
            const loadingTask = pdfjsLib.getDocument(props.fileUrl);
            pdfRef.current = await loadingTask.promise;
            renderPage();
        };
        
        loadPdf();
        }, [props.fileUrl]);
    
    useEffect (()=>{

        renderPage();
    }, [props.page,props.rotation, props.scale])

    useEffect(() => {
        const canvasElement = annotationCanvasDomRef.current;
        if (!canvasElement) return;

        const fC = new Canvas(canvasElement, {
            isDrawingMode: true,
        });

        
        
        annotationCanvasRef.current = fC;

        fC.setWidth(viewport.width);
        fC.setHeight(viewport.height);
        props.setFabricCanvas(fC);
        return () => {
            fC.dispose();
        };

    }, [viewport])

    const renderPage = async () => {
            const pdf = pdfRef.current;
            if (!pdf) return;

            const page = await pdf.getPage(props.page);
            const viewport = page.getViewport({ scale: props.scale, rotation: props.rotation });

            setViewport({width:viewport.width, height:viewport.height});

            const canvas = canvasRef.current!;
            if(!canvas) return;
            console.log(canvasRef.current)
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
    }

    return (
    <div className='relative inline-block' style={{ width: viewport.width, height: viewport.height }}>
        <canvas ref={canvasRef} width={viewport.width} height={viewport.height} className='absolute z-1'/>
        <canvas ref={annotationCanvasDomRef} width={viewport.width} height={viewport.height} style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', width: viewport.width, height: viewport.height }} className="absolute top-0 left-0 pointer-events-auto z-10" />
    </div>
    
);
        
    
}