import React from 'react'
import {useState, useRef} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown,faClone} from '@fortawesome/fontawesome-free-solid'
import 'font-awesome/css/font-awesome.min.css';
import { gql , useMutation } from '@apollo/client';
import { useQuery } from '@apollo/client';
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
        const {loading,error, data} = useQuery(GET_ALL_URLS);
        
        const [copySuccess , setCopySuccess] = useState('');
     
        let myCreatedLink = "http://127.0.0.1:8000/";
        const onSubmit = (e) =>{
                e.preventDefault();
                link =  e.target[0].value;
                console.log("Link :"+link);
                if(!isAlreadyLinkExist(link)){
                  return ;
                }
        convertLink(link);
        }
        

        const isAlreadyLinkExist = (link) => {
          console.log("data:",data);
          let myResult = data.urls.filter( d => d.fullUrl == link);
          if(myResult != 0){
                myCreatedLink += myResult[0]["urlHash"];
                setShortyLink(myCreatedLink);
                return false;
          }
        return true;
        }

        const convertLink = async (link) => {
                //do GraphQL operation
                await createLink({
                        variables :{
                                fullUrl: link,
                        }
                }).then(res => {
                        myCreatedLink += res.data.createUrl.url["urlHash"]
                });
               setShortyLink(myCreatedLink);
        }       

        const copyToClipBoard = () => {
                if(!validateText()) return ;
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
                                        Shorten&nbsp;&nbsp;
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
