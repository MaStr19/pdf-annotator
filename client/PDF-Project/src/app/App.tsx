import { useState, useEffect } from 'react'
import PDFViewer from '../components/pdfviewer'
import Navbar from '../components/navbar'
import './App.css'

import { Canvas } from 'fabric'

function App() {
 
    
    const [rotation, setRotation] = useState(0);
    const [page, setPage] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [annotate, setAnnotate] = useState(false);

    const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null)

    useEffect(() => {
    console.log('Page updated:', page);
    }, [page]);

  return (
    <>
      
    <div className='bg-gray-200'>
        <div className='bg-white border-solid border-b-1'>
            <header className="h-20 p-4">
                <div className='w-50'>
                    <a className="block text-teal-600" href="https://www.taxpeer.de">
                        <img className="w-max h-10" src="https://cdn.prod.website-files.com/6683aafb774e070340fd2bcc/66a7ef7362615531efb51614_Logo_Full.png"></img>
                    </a>
                </div>
                
            </header>
        </div>
        <div className='bg-white m-4 border-solid border-1 rounded-md flex flex-col justify-center items-center space-x-6'>
            <div className='h-20 w-full m-0'>
                <Navbar 
                setPage={setPage} 
                setRotation={setRotation} 
                setScale={setScale} 
                setAnnotate={setAnnotate} 
                annotate={annotate} 
                rotation={rotation} 
                page={page} 
                scale={scale}
                fabricCanvas={fabricCanvas}
                />
            </div>
            <button
                onClick={() => {
                    if (!fabricCanvas) return;

                    fabricCanvas.isDrawingMode = true;

                    if (fabricCanvas.freeDrawingBrush) {
                    fabricCanvas.freeDrawingBrush.color = '#0070f3';
                    fabricCanvas.freeDrawingBrush.width = 5;
                    }
                }}
                >
                Enable Draw Mode
            </button>
            <div className='overflow-hidden'>
                <PDFViewer 
                fileUrl='/example.pdf' 
                rotation={rotation} 
                page={page} 
                scale={scale}
                fabricCanvas={fabricCanvas}
                setFabricCanvas={setFabricCanvas}
                />
            </div>
        </div>
    </div>
        
    
    </>
  )
}

export default App
