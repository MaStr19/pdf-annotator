import { useState, useEffect } from 'react'
import PDFViewer from '../components/pdfviewer'
import Navbar from '../components/navbar'
import './App.css'

import { Canvas } from 'fabric'
import type jsPDF from 'jspdf'

function App() {
 
    
    const [rotation, setRotation] = useState(0);
    const [page, setPage] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [tool, setTool] = useState("select");

    const [pdf, setPdf] =useState<jsPDF | null>(null);
    const [download, setDownload] =useState<boolean>(false);

    const [annotate, setAnnotate] = useState<Record<number, Canvas>>({});

    useEffect(() => {
    
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
                rotation={rotation} 
                page={page} 
                scale={scale}
                tool={tool}
                setTool={setTool}
                setDownload={setDownload}
                download={download}
                
                />
            </div>

            <div className='overflow-hidden border-solid border-2 '>
                <PDFViewer 
                fileUrl='/example.pdf' 
                rotation={rotation} 
                page={page} 
                scale={scale}
                annotate={annotate}
                setAnnotate={setAnnotate}
                tool={tool}
                download={download}
                setPdf={setPdf}
                setTool={setTool}
                />
            </div>
        </div>
    </div>
        
    
    </>
  )
}

export default App
