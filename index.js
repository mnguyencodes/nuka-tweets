import { data } from "./data.js"
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

let tweetsData = data

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
    else if(e.target.dataset.replyActionIcon){
        handleReplyActionIcon(e.target.dataset.replyActionIcon)
    }
    else if(e.target.id === "reply-btn"){
        handleReplyActionBtn(document.querySelector("#reply-input"))
    }
    else if (e.target.id === "close-modal-btn"){
        handleCloseModalBtn()
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
    localStorage.setItem(`targetTweetObj-${tweetId}`, JSON.stringify(targetTweetObj))
    render()
}

function handleRetweetAction(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    targetTweetObj.retweets += targetTweetObj.isRetweeted ? -1 : 1

    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    localStorage.setItem(`targetTweetObj-${tweetId}`, JSON.stringify(targetTweetObj))
    render() 
}

function handleReplyAction(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle("hidden")
}

function handleTweetBtnAction(){
    const tweetInput = document.getElementById("tweet-input")
    addTweet(tweetInput, tweetsData)
    localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
}

function handleCloseModalBtn(){
    document.getElementById("modal").style.display = "none"
}

function addTweet(inputEl, arr){
    if (!inputEl.value){
        return false
    }
    arr.unshift({
        handle: `@You`,
        profilePic: `/images/vault_boy.png`,
        likes: 0,
        retweets: 0,
        tweetText: inputEl.value,
        replies: [],
        isLiked: false,
        isRetweeted: false,
        uuid: uuidv4()
    })
    render()
    inputEl.value = ""
    return true
}

function handleReplyActionIcon(tweetId){
    document.getElementById("modal").style.display = "block"

    const userHandle = tweetsData.filter(tweet=>tweet.uuid === tweetId)[0].handle
    const replyInputEl = document.getElementById("reply-input")
    replyInputEl.placeholder = `Reply to ${userHandle}`

    /* Store UUID of new reply tweet into name attribute of textarea 
    input. This allows me to find out **which tweet-replies array** to 
    add in the new reply. */
    replyInputEl.name = tweetId
}

function handleReplyActionBtn(replyInput){
    for (let tweet of tweetsData){
        if (tweet.uuid === replyInput.name){
            if (addTweet(replyInput, tweet.replies)) {
                document.getElementById("modal").style.display = "none"
                localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
            }
        }
    }
    render()
}

function handleTrashCanAction(tweetId){
    removeTweet(tweetId)
}

function getFeedHtml(){
    let feedHtml = ``
    let i = 0
    tweetsData.forEach(function(tweet){
        const tweetFromLocalStorage = JSON.parse(localStorage.getItem(`targetTweetObj-${tweet.uuid}`))
        if (tweetFromLocalStorage){
            tweet = tweetFromLocalStorage
            tweetsData[i] = tweetFromLocalStorage
        }
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
            <div class="tweet-reply" id="replies-${reply.uuid}">
                <div class="tweet-inner">
                    <img src="${reply.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${reply.handle}</p>
                        <p id="reply-text-${reply.uuid}" class="tweet-text"></p>
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
                    <span class="tweet-detail">
                        <i tabindex="0" class="fa-solid fa-reply"
                        data-reply-action-icon="${tweet.uuid}"
                        ></i>
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
    i++
   })
   return feedHtml 
}

/* Prevent user from injecting malicious code. */
function setTweetTexts(){
    tweetsData.forEach(tweet=>{
        if (tweet.replies.length > 0){
            tweet.replies.forEach(reply=>{
                document.querySelector(`#reply-text-${reply.uuid}`).textContent = reply.tweetText
            })
        }
    })

    tweetsData.forEach(tweet=>{
        const tweetTextEl = document.querySelector(`#tweet-text-${tweet.uuid}`)
        tweetTextEl.textContent = tweet.tweetText
    })
}

function removeTweet(tweetId){
    document.querySelector(`#tweets-${tweetId}`).remove()
    for (let i = 0; i < tweetsData.length; i++){
        const tweetPost = tweetsData[i]
        if (tweetPost.uuid === tweetId){
            tweetsData.splice(i, 1)
            localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
            break
        }
    }
}

function render(){
    document.getElementById("feed").innerHTML = getFeedHtml()
    setTweetTexts()
}

const tweetsDataFromLocalStorage = JSON.parse(localStorage.getItem("tweetsData"))
if (tweetsDataFromLocalStorage){
    tweetsData = tweetsDataFromLocalStorage
    render()
}

/* Generate UUIDs */
function generateUuid(number){
    for(let i = 0; i < number; i++){
        console.log(uuidv4())
    }
}

//generateUuid(4)
