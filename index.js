import { tweetsData } from "./data.js"
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

document.addEventListener("click", handleInteraction)
document.addEventListener("keydown", handleInteraction)

function handleInteraction(e){
    if (e.type !== "click" && e.key !== "Enter"){
        return
    }
    if(e.target.dataset.like){
        handleLikeAction(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetAction(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyAction(e.target.dataset.reply)
    }
    else if(e.target.id === "tweet-btn"){
        handleTweetBtnAction()
    }
    else if(e.target.dataset.trashCan){
        handleTrashCanAction(e.target.dataset.trashCan)
    }
}

function handleLikeAction(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    targetTweetObj.likes += targetTweetObj.isLiked ? -1: 1

    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
}

function handleRetweetAction(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    targetTweetObj.retweets += targetTweetObj.isRetweeted ? -1 : 1

    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render() 
}

function handleReplyAction(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle("hidden")
}

function handleTweetBtnAction(){
    const tweetInput = document.getElementById("tweet-input")

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@You`,
            profilePic: `/images/vault_boy.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
    render()
    tweetInput.value = ""
    }
}

function handleTrashCanAction(tweetId){
    document.querySelector(`#tweets-${tweetId}`).classList.add("hidden")
}

function getFeedHtml(){
    let feedHtml = ``
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = tweet.isLiked ? "liked" : ""
        let retweetIconClass = tweet.isRetweeted ? "retweeted" : ""
        
        let trashCan = tweet.handle !== "@You" ? '' : `
            <span class="tweet-detail">
                <i tabindex="0" class="fa-solid fa-trash" data-trash-can="${tweet.uuid}"></i>
            </span>
        `

        let repliesHtml = ""
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml+=`
            <div class="tweet-reply">
                <div class="tweet-inner">
                    <img src="${reply.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${reply.handle}</p>
                        <p id="reply-text-${tweet.uuid}" class="tweet-text">${tweet.tweetText}</p>
                    </div>
                </div>
            </div>
            `
            })
        }

    feedHtml += `
    <div class="tweet" id=tweets-${tweet.uuid}>
        <div class="tweet-inner">
            <img src="${tweet.profilePic}" class="profile-pic">
            <div>
                <div class="mb0 handle-container">
                    <p class="handle">${tweet.handle}</p>
                </div>
                <p id="tweet-text-${tweet.uuid}" class="tweet-text"></p>
                
                
                
                <div class="tweet-details">
                    <span class="tweet-detail">
                        <i tabindex="0" class="fa-regular fa-comment-dots"
                        data-reply="${tweet.uuid}"
                        ></i>
                        ${tweet.replies.length}
                    </span>
                    <span class="tweet-detail">
                        <i tabindex="0" class="fa-solid fa-heart ${likeIconClass}"
                        data-like="${tweet.uuid}"
                        ></i>
                        ${tweet.likes}
                    </span>
                    <span class="tweet-detail">
                        <i tabindex="0" class="fa-solid fa-retweet ${retweetIconClass}"
                        data-retweet="${tweet.uuid}"
                        ></i>
                        ${tweet.retweets}
                    </span>
                    ${trashCan}
                </div>   
            </div>            
        </div>
        <div class="hidden" id="replies-${tweet.uuid}">
            ${repliesHtml}
        </div>   
    </div>
    `
   })
   return feedHtml 
}

function setTweetTexts(){

    // tweetsData.forEach(tweet=>{
    //     if (tweet.replies.length > 0){
    //         tweet.replies.forEach(reply=>{
    //             // console.log(reply.tweetText)
    //             // const replyTextEl = document.querySelector(`#reply-text-${tweet.uuid}`)
    //             document.querySelector(`#reply-text-${tweet.uuid}`).textContent = reply.tweetText
    //             console.log(document.querySelector(`#reply-text-${tweet.uuid}`))
    //             // replyTextEl.textContent = reply.tweetText

    //         })
    //     }
    // })

    tweetsData.forEach(tweet=>{
        const tweetTextEl = document.querySelector(`#tweet-text-${tweet.uuid}`)
        tweetTextEl.textContent = tweet.tweetText
    })
}

function render(){
    document.getElementById("feed").innerHTML = getFeedHtml()
    setTweetTexts()
}

render()
