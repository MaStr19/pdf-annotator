import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import { Canvas, PencilBrush, Textbox} from 'fabric';
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
    setDownload:React.Dispatch<React.SetStateAction<boolean>>,
    setPage:React.Dispatch<React.SetStateAction<number>>,
    download:boolean,
    upload:boolean,
    token:string,
    fileData:Uint8Array|ArrayBuffer

    }){


    

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfRef = useRef<any | null>(null);
    const [viewport, setViewport] = useState({width: 0, height: 0})
    
    const [annotate, setAnnotate] = useState<Record<number, any>>(page_annotations_record);

    const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
    const editcanvasRef = useRef<Canvas>(null);
    const pdf = useRef<any>(null)
    const isMounted = useRef(false);
    

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!props.fileData) return;

            
            const data =
            props.fileData instanceof Uint8Array
                ? props.fileData.slice() 
                : new Uint8Array(props.fileData).slice();

            const loadingTask = pdfjsLib.getDocument({ data });
            try {
            const pdf = await loadingTask.promise;
            if (cancelled) return;
            pdfRef.current = pdf;
            await renderPage();
            } catch (e) {
            if (!cancelled) console.error(e);
            }
        })();
        return () => { cancelled = true; };
    }, [props.fileData]);


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
        if(props.tool =="erase"){
            editcanvasRef.current.getActiveObjects().forEach(obj => { editcanvasRef.current?.remove(obj)});
            editcanvasRef.current.renderAll();
            props.setTool("select");
        }
        if(props.tool=="draw"){
            editcanvasRef.current.isDrawingMode = true;
            editcanvasRef.current.freeDrawingBrush = new PencilBrush(editcanvasRef.current);
            editcanvasRef.current!.requestRenderAll();
            
        }
        if(props.tool == "highlight"){
            editcanvasRef.current.isDrawingMode = true;
            editcanvasRef.current.freeDrawingBrush = new PencilBrush(editcanvasRef.current);
            editcanvasRef.current.freeDrawingBrush.color = "rgba(255, 255, 0, 0.4)";
            editcanvasRef.current.freeDrawingBrush.width = 15;
            editcanvasRef.current.freeDrawingBrush.strokeLineCap = "round";            
            editcanvasRef.current!.requestRenderAll();


        }
        
        if(props.tool == "text"){
            editcanvasRef.current.isDrawingMode = false;

            editcanvasRef.current.on('mouse:down', (opt) => {

                const target = editcanvasRef.current!.getActiveObject();
                if (target) return;

                const pointer = editcanvasRef.current!.getScenePoint(opt.e);
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
        });
    }
    return(()=>{
        if(!(props.tool=="draw")){
            props.setTool("select");
        }
    })
    },[props.tool])


    
    


    useEffect(()=>{
        if (!annotationCanvasRef.current) return;

        if(!annotate[props.page]){

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
            let current_drawing = editcanvasRef.current?.toJSON()
            page_annotations_record[props.page] = current_drawing;
            setAnnotate(page_annotations_record);
        })
        
    },[props.page, props.rotation, viewport, props.scale])

    useEffect (()=>{
        renderPage();
    }, [props.page,props.rotation, props.scale])


    
    const renderPage = async () => {

            const pdf = pdfRef.current;
            if (!pdf) return;
            page_num = pdf.numPages;
            let page;
            if(props.page > page_num){
                props.setPage(page_num);
                return;
            }else{
                page = await pdf.getPage(props.page);
                console.log(page)
                console.log(page._pageInfo.view)

            }
            
            
            const viewport = page.getViewport({ scale: props.scale, rotation: 0 });
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

        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = canvasRef.current.width;
        combinedCanvas.height = canvasRef.current.height;
        const ctx = combinedCanvas.getContext('2d');

        const tempAnnotationCanvas = document.createElement('canvas');
        tempAnnotationCanvas.width = canvasRef.current.width;
        tempAnnotationCanvas.height = canvasRef.current.height;
        const tempFabric = new Canvas(tempAnnotationCanvas,{
            enableRetinaScaling: false
        });
        if (annotate[index]) {
            await tempFabric.loadFromJSON(annotate[index]);
            tempFabric.setViewportTransform([3, 0, 0, 3, 0,0]);
            tempFabric.renderAll();

        }

        ctx!.drawImage(canvasRef.current!, 0, 0);

        ctx!.drawImage(tempAnnotationCanvas, 0, 0);

        const jpegDataUrl = combinedCanvas.toDataURL('image/jpeg', 2);

        return jpegDataUrl;
    };
    useEffect(()=>{

        if(!isMounted.current){
            isMounted.current = true;
            return;
        }
        let file:File;

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
            const blob = return_doc.output("blob");
            file = new File([blob], "annotated.pdf", {type: "application/pdf"})
            
            
            pdf.current = file;
            renderPage()
            if(props.download){
                props.setDownload(false)
                return_doc.save('annotated.pdf');
            }
            
        }
        if(props.download){
            exportAllPages();
        }
        if(props.token){
            
            const uploading = async ()=>{

                await exportAllPages();
                try{
                    const formData = new FormData();
                    formData.append("file", file)
                    const res = await fetch("/api/upload-pdf", {
                        method: "POST",
                        headers:{Authorization: `Bearer ${props.token}`},
                        body: formData,
                    });

                    let return_body = await res.json().then(x=>{
                        return(
                        `
                        ${x.message}\n\n
                        File ID: ${x.file_id}\n
                        Filename: ${x.filename}\n
                        Original Filename: ${x.original_filename}\n
                        Size in Bytes: ${x.size_bytes.toString()}\n
                        Uploaded by: ${x.uploaded_by}\n
                        Uploaded at: ${x.uploaded_at}\n
                        File Hash: ${x.file_hash}\n
                        `
                        )

                    })
                    alert(return_body)
                }catch{
                    return;
                }
            
            }
            uploading();
        }

    }, [props.download, props.token])

    return (
    <div className='relative inline-block' style={{ width: viewport.width, height: viewport.height }}>
        <canvas ref={canvasRef} width={viewport.width} height={viewport.height} className='absolute z-1'/>
        <canvas ref={annotationCanvasRef} width={viewport.width} height={viewport.height} style={{ width: viewport.width, height: viewport.height }} className="absolute top-0 left-0 pointer-events-auto z-10" />
    </div>
    
);
        
    
}