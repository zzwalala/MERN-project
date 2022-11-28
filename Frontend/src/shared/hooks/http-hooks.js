import { useState, useCallback, useRef, useEffect } from "react"

export const useHttpClient = () => {
    
    const [isLoading, setisLoading] = useState(false);
    const [error, setError] = useState();

    const activeRequest = useRef([])

    const sendrequest = useCallback( async (url, method = 'GET', body=null, headers={}) => {
        setisLoading(true)
        const httpAbortCtrl = new AbortController()
        activeRequest.current.push(httpAbortCtrl)
        try{
        const response = await fetch(url, {
            method,
            body,
            headers,
            signal: httpAbortCtrl.signal
        })
        const responseData = await response.json()

        activeRequest.current = activeRequest.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl)

        if (!response.ok){
        throw new Error(responseData.message)
        }
        setisLoading(false)
        return responseData
    }catch(err){
        setError(err.message)
        setisLoading(false)
        throw err
    }
    }, [])

    const clearError = () => {
        setError(null)
    }

    useEffect(() => {
        return () => {
        activeRequest.current.forEach(abortCtrl => abortCtrl.abort())
        }
    }, [])

    return {isLoading, error, sendrequest, clearError}
}