import { useState } from "react";



export default function Navbar(props:{
    setPage:React.Dispatch<React.SetStateAction<number>>, 
    setScale:React.Dispatch<React.SetStateAction<number>>, 
    setRotation:React.Dispatch<React.SetStateAction<number>>,
    rotation:number, 
    page:number, 
    scale:number
    tool:string,
    setTool:React.Dispatch<React.SetStateAction<string>>
}){
    
    const [mode, setMode] = useState(true);

    function handleModeChange(state:boolean){
        
            setMode(state);
            
        
    }

    function handleRotate(){
        if(props.rotation == 270){
            props.setRotation(0);
        }
        else{
            props.setRotation(props.rotation +90)
        }
    }
    function handleCounterRotate(){
        if(props.rotation == 0){
            props.setRotation(270);
        }
        else{
            props.setRotation(props.rotation - 90)
        }
    }
    function handlePageIncrement(){
        if(props.page == -1){
            
            props.setPage(1);
        }
        else{
            
            props.setPage(props.page + 1)
        }
    }
    function handlePageDecrement(){
        if(props.page == 1){
            props.setPage(1);
        }
        else{
            props.setPage(props.page - 1)
        }
    }
    function handleScaleIncrement(){
        if(props.scale == 3){
            props.setScale(3);
        }
        else{
            props.setScale(props.scale + 0.25)
        }
    }
    function handleScaleDecrement(){
        if(props.scale == 0.25){
            props.setScale(0.25);
        }
        else{
            props.setScale(props.scale - 0.25)
        }
    }


    return(
        <>
        <div className="w-auto flex flex-col items-center justify-center border-b-1 border-solid pt-0 pb-0">
            <header>
            <div>
           
                    <header className="w-full flex flex-row gap-x-4">
                        <ul>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>{handleCounterRotate()}}>counter-clockwise</button>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handleRotate()}>clockwise</button>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handlePageIncrement()}>up</button>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handlePageDecrement()}>down</button>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handleScaleIncrement()}>zoom-in</button>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>handleScaleDecrement()}>zoom-out</button>
                        </ul>
                        <ul>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>props.setTool("draw")}>Draw</button>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>props.setTool("text")}>Text</button>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" onClick={()=>props.setTool("select")}>Select</button>
                        </ul>
                        <ul>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" >Upload</button>
                            <button className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4" >Download</button>

                        </ul>
                    </header>
                
            </div>
            </header>
        </div>
        </>
    )
    
}