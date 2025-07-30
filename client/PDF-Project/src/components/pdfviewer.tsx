import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { Canvas, PencilBrush, Textbox } from 'fabric';



GlobalWorkerOptions.workerSrc = pdfjsWorker;
let page_annotations_record: Record<number, any> = {};


export default function PDFViewer(props: {
    fileUrl:string, 
    rotation:number, 
    page:number, 
    scale:number,
    annotate:any,
    setAnnotate:any
    tool:string,
    setTool:React.Dispatch<React.SetStateAction<string>>
    }){


    

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfRef = useRef<any | null>(null);
    const [viewport, setViewport] = useState({width: 0, height: 0})
    
    const [annotate, setAnnotate] = useState<Record<number, any>>(page_annotations_record);

    const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
    const editcanvasRef = useRef<Canvas>(null);

    
    useEffect(()=>{

        let canvas = new Canvas(annotationCanvasRef.current!, {
            isDrawingMode: true,
            height: 1000,
            width:1000
        });

        canvas.freeDrawingBrush = new PencilBrush(canvas);

        editcanvasRef.current = canvas;

        return(()=>{
            canvas.dispose();
            editcanvasRef.current = null;
        })
    },[])


    useEffect(()=>{
        if (!editcanvasRef.current) return;
        
        if(props.tool=="drawing"){
            editcanvasRef.current.isDrawingMode = true;
            editcanvasRef.current.freeDrawingBrush = new PencilBrush(editcanvasRef.current);
        }
        
        if(props.tool == "text"){
            editcanvasRef.current.isDrawingMode = false;

            editcanvasRef.current.on('mouse:down', (opt) => {

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
    

    },[props.tool])



    useEffect(() => {
        const loadPdf = async () => {
            const loadingTask = pdfjsLib.getDocument(props.fileUrl);
            pdfRef.current = await loadingTask.promise;
            renderPage();

        };
        
        loadPdf();
        }, [props.fileUrl]);
    
    


    useEffect(()=>{
        if (!annotationCanvasRef.current) return;

        if(!annotate[props.page]){

            console.log("Your freshly drawing")
            editcanvasRef.current!.clear();
            

        }else{
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
            console.log(current_drawing)
        })
        
    },[props.page, props.rotation, viewport])

    useEffect (()=>{
        renderPage();
    }, [props.page,props.rotation, props.scale])

    const renderPage = async () => {

            const pdf = pdfRef.current;
            if (!pdf) return;

            const page = await pdf.getPage(props.page);
            
            const viewport = page.getViewport({ scale: props.scale, rotation: props.rotation });
            setViewport({width:viewport.width, height:viewport.height});



            const canvas = canvasRef.current!;
            if(!canvas) return;
            await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
    }

    return (
    <div className='relative inline-block' style={{ width: viewport.width, height: viewport.height }}>
        <canvas ref={canvasRef} width={viewport.width} height={viewport.height} className='absolute z-1'/>
        <canvas ref={annotationCanvasRef} width={viewport.width} height={viewport.height} style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', width: viewport.width, height: viewport.height }} className="absolute top-0 left-0 pointer-events-auto z-10" />
    </div>
    
);
        
    
}