import React from 'react'
import {useState, useRef} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown,faClone} from '@fortawesome/fontawesome-free-solid'
import 'font-awesome/css/font-awesome.min.css';
import { gql , useMutation } from '@apollo/client';
import { useQuery } from '@apollo/client';
import './styles.css';
export const Lander = () => {
        let link;

        const SEARCH_URL = gql` 
           query($fullUrl: String!){
                urls(url : $fullUrl){
                  urlHash
                }
              }
        `;

        const GET_ALL_URLS = gql`
        {
                urls {
                  id
                  fullUrl
                  urlHash
                  clicks
                  createdAt
                }
              }
              
        `;

        const CREATE_SHORTENED_LINK = gql`
        mutation ($fullUrl: String!){
                createUrl(fullUrl: $fullUrl) {
                url {
                        id
                        fullUrl
                        urlHash
                        clicks
                        createdAt
                }
            }
        }
        `
        const [shortyLink , setShortyLink] = useState("shortLink"); 
        const [createLink] = useMutation(CREATE_SHORTENED_LINK);
        const {loading,error, data, refetch} = useQuery(GET_ALL_URLS);
        const [isLoading , setIsLoading] = useState(false)
        const [copySuccess , setCopySuccess] = useState('');
     
        let myCreatedLink = `${process.env.REACT_APP_BACKEND_URL}/`;
        const onSubmit = (e) =>{
                e.preventDefault();
                link =  e.target[0].value;
                setIsLoading(true);
                try{
                console.log("Link :"+link);
                if(!isAlreadyLinkExist(link)){
                  return ;
                }
                convertLink(link);
                setTimeout( () => setIsLoading(false), 1000);
                }catch(e){
                  alert("Couldn't create the Short Link something went wrong, Please try later");
            }
        }

        const isAlreadyLinkExist = (link) => {
          console.log("data:",data);
          if(error) throw new Error("Problem with Backend")
          let myResult = data.urls.filter( d => d.fullUrl == link);
          console.log("My Result",myResult)
          if(myResult != 0){
                myCreatedLink += myResult[0]["urlHash"];
                setShortyLink(myCreatedLink);
                return false;
          }
        return true;
        }

        const convertLink = async (link) => {
                //do GraphQL operation
                try{
                await createLink({
                        variables :{
                                fullUrl: link,
                        }
                }).then(res => {
                        myCreatedLink += res.data.createUrl.url["urlHash"]
                });
               setShortyLink(myCreatedLink);
                }catch(e){
                        refetch();
                        if(!alert("Please reload page and try again")){
                                window.location.reload();
                        }
                }
        }

        const copyToClipBoard = () => {
                if(!validateText()){
                        alert("There is ntg to copy, make sure to click on shorten Button provided") 
                        return;
                }
                navigator.clipboard.writeText(shortyLink)
                setCopySuccess('Copied to ClipBoard');
        }

        const validateText = () =>{
                return shortyLink != 'shortLink' ;
        }


    return (
        <>
    
                <section className="hero-container">
                <div className="hero-text">
                        <div className = "txt1">
                                Got a Long URL that you want to share
                        </div>
                        <div className = "txt2">
                                Just Shorten.It
                        </div>
                        <div className = "txt3">
                                It’s that simple !!!
                        </div>
                </div>
                <div className="shorten-form">
                        <form onSubmit = { (e) => onSubmit(e)}>
                                <div className = "title">
                                        Shorten URL
                                </div>
                                <div className="inp-group" id = "original">
                                        <input type ="text" autoComplete="off" required></input>
                                        <label>Original URL</label>
                                </div>
                                <button type = "submit">
                                        {(isLoading) ? 'loading' : 'Shorten' }&nbsp;&nbsp;
                                        <FontAwesomeIcon icon = {faChevronDown} size = "1x"/>
                                </button>
                                <div className = "inp-group" id = "short">
                                        <input type="text" autoComplete="off" disabled value = {shortyLink}                                 ></input>
                                        {/* <label>Shortened URL</label> */}
                                        <div className="copy" >
                                        <a onClick={() => copyToClipBoard()}>
                                                <FontAwesomeIcon icon = {faClone} size = "1x"/>
                                        </a>
                                        </div>
                                </div>
                        </form>
                        <div> {copySuccess} </div>
                </div>
                </section>
      
        </>
    )
}
