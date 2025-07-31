import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { Canvas, PencilBrush, Textbox } from 'fabric';
import jsPDF from 'jspdf';


GlobalWorkerOptions.workerSrc = pdfjsWorker;
let page_annotations_record: Record<number, any> = {};
let page_num:number;

export default function PDFViewer(props: {
    fileUrl:string, 
    rotation:number, 
    page:number, 
    scale:number,
    annotate:any,
    setAnnotate:any
    tool:string,
    setTool:React.Dispatch<React.SetStateAction<string>>,
    setPage:React.Dispatch<React.SetStateAction<number>>

    }){


    

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfRef = useRef<any | null>(null);
    const [viewport, setViewport] = useState({width: 0, height: 0})
    
    const [annotate, setAnnotate] = useState<Record<number, any>>(page_annotations_record);

    const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
    const editcanvasRef = useRef<Canvas>(null);

    
    useEffect(()=>{

        let canvas = new Canvas(annotationCanvasRef.current!, {
            isDrawingMode: false,
            height: 0,
            width:0
        });

        editcanvasRef.current = canvas;

        return(()=>{
            canvas.dispose();
            editcanvasRef.current = null;
        })
    },[])


    useEffect(()=>{
        if (!editcanvasRef.current) return;

        editcanvasRef.current.isDrawingMode = false;
        editcanvasRef.current.off('mouse:down');


        if(props.tool == "select"){
            return;
        }
        if(props.tool=="draw"){
            editcanvasRef.current.isDrawingMode = true;
            editcanvasRef.current.freeDrawingBrush = new PencilBrush(editcanvasRef.current);
            editcanvasRef.current!.requestRenderAll();
        }
        
        if(props.tool == "text"){
            console.log(props.tool)
            editcanvasRef.current.isDrawingMode = false;

            editcanvasRef.current.on('mouse:down', (opt) => {

                const target = editcanvasRef.current!.getActiveObject();
                if (target) return;

                const pointer = editcanvasRef.current!.getScenePoint(opt.e);
                console.log(pointer)
                const textbox = new Textbox('Enter text', {
                    left: pointer.x,
                    top: pointer.y,
                    fontSize: 18,
                    fill: 'black',
                    editable: true,
                    borderColor: 'blue',
                    cornerColor: 'green',
                    transparentCorners: false,
                });
                editcanvasRef.current!.add(textbox);
                editcanvasRef.current!.requestRenderAll();
                console.log("We got Texting going on over here")
        });
    }

    
    


    return(()=>{
        if(!(props.tool=="draw")){
            props.setTool("select");
        }
    })
    },[props.tool])



    useEffect(() => {
        const loadPdf = async () => {
            const loadingTask = pdfjsLib.getDocument(props.fileUrl);
            pdfRef.current = await loadingTask.promise;
            await renderPage();

        };
        
        loadPdf();
        }, [props.fileUrl]);
    
    


    useEffect(()=>{
        if (!annotationCanvasRef.current) return;

        if(!annotate[props.page]){

            console.log("Your freshly drawing")
            editcanvasRef.current!.clear();
            

        }else{
            editcanvasRef.current!.clear();
            editcanvasRef.current?.loadFromJSON(annotate[props.page])
            editcanvasRef.current?.setHeight(viewport.height);
            editcanvasRef.current?.setWidth(viewport.width);
            
            switch(props.rotation){
                case 0:
                    editcanvasRef.current?.setViewportTransform([props.scale, 0, 0, props.scale, 0,0]);
                    break;
            }
            

            editcanvasRef.current!.requestRenderAll();

        }

        return(()=>{
            console.log("Your saving")
            let current_drawing = editcanvasRef.current?.toJSON()
            page_annotations_record[props.page] = current_drawing;
            setAnnotate(page_annotations_record);
            console.log(annotate)
        })
        
    },[props.page, props.rotation, viewport, props.scale])

    useEffect (()=>{
        renderPage();
    }, [props.page,props.rotation, props.scale])


    
    const renderPage = async () => {

            const pdf = pdfRef.current;
            if (!pdf) return;

            const page = await pdf.getPage(props.page);
            page_num = pdf.numPages;
            const viewport = page.getViewport({ scale: props.scale, rotation: props.rotation });
            setViewport({width:viewport.width, height:viewport.height});

            
            const canvas = canvasRef.current!;
            if(!canvas) return;
            await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
    }
    const renderPage_overload = async (j:number) => {

            const pdf = pdfRef.current;
            if (!pdf) return;

            const page = await pdf.getPage(j);
            page_num = pdf.numPages;
            const viewport = page.getViewport({ scale: 3, rotation: props.rotation });
            setViewport({width:viewport.width, height:viewport.height});

            
            const canvas = canvasRef.current!;
            if(!canvas) return;
            await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
    }


    const exportCombinedJpeg = async (index:number) => {
        await renderPage_overload(index);
        const annotationCanvas = annotationCanvasRef.current;
        if (!canvasRef.current! || !annotationCanvas) return;

        // Create a new canvas to combine both
        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = canvasRef.current.width;
        combinedCanvas.height = canvasRef.current.height;
        const ctx = combinedCanvas.getContext('2d');

        const tempAnnotationCanvas = document.createElement('canvas');
        tempAnnotationCanvas.width = canvasRef.current.width;
        tempAnnotationCanvas.height = canvasRef.current.height;
        const tempFabric = new Canvas(tempAnnotationCanvas);
        if (annotate[index]) {
            await tempFabric.loadFromJSON(annotate[index]);
            tempFabric.setViewportTransform([3, 0, 0, 3, 0,0]);
            tempFabric.renderAll();

        }

        // Draw PDF
        ctx!.drawImage(canvasRef.current!, 0, 0);

        // Draw annotation
        ctx!.drawImage(tempAnnotationCanvas, 0, 0);

        // Export as JPEG
        const jpegDataUrl = combinedCanvas.toDataURL('image/jpeg', 2);

        return jpegDataUrl;
    };

    const exportAllPages =  async() =>{
        
        let return_arr = [];
        let return_doc = new jsPDF({
            orientation:'portrait',
            format: [viewport.height, viewport.width]
        })

        for(let i= 1; i <=page_num; i++){
            
            let image_data = await exportCombinedJpeg(i);
            return_arr.push(image_data);
            return_doc.addImage(image_data!, 'JPEG', 0, 0, viewport.width, viewport.height, i.toString(), 'NONE', 0);
            if(i!=page_num){
                return_doc.addPage([viewport.height, viewport.width], 'portrait')
            }
        }

        return_doc.save('annotated.pdf');
    }


    return (
    <div className='relative inline-block' style={{ width: viewport.width, height: viewport.height }}>
        <canvas ref={canvasRef} width={viewport.width} height={viewport.height} className='absolute z-1'/>
        <canvas ref={annotationCanvasRef} width={viewport.width} height={viewport.height} style={{ width: viewport.width, height: viewport.height }} className="absolute top-0 left-0 pointer-events-auto z-10" />
        <button onClick={()=>exportAllPages()}>Download</button>
    </div>
    
);
        
    
}