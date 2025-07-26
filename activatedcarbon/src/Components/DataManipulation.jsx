import React, {useState , useEffect} from "react";

export default function DataManipulation (Query_Id){
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    switch(Query_Id){
        
        case 1:
            const API_URL = "http://localhost:8000/api/supplier_performance";
            console.log(API_URL)
            getdata(API_URL,setData,setLoading,setError);
            console.log("here..",data);
            if (error) return data;
            if (data.length === 0) return data;
            return(assignDeliveryOrder(data))
            break;
        default :
    }

}

function getdata (API_URL,setData,setLoading,setError){
    useEffect(() => {
        fetch(API_URL)
          .then(res => res.json())
          .then(json => {
            setData(json.data);
            setLoading(false)
          })
          .catch((err) => {
            setError(err.message);
            setLoading(false);
          });
      }, []);
}

