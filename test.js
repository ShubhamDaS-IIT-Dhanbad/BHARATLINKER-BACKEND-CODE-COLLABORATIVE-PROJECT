import axios from 'axios'
const apiKey=
'G0lfMRsCikv1tKmPLVzJE75WpTw8Hyb2Qn3DrU69oecAaOIZ4u2n0NQIERT3zWYh65AlrisfBbLSux79'
const message="hello you"
const phoneNumber='9382611789'

const smsData={
    sender_id:"FSTSMS",
    message:message,
    language:"english",
    route:"otp",
    numbers:phoneNumber
}

axios
    .post('https://www.fast2sms.com/dev/bulkV2',smsData,{
        headers:{
            Authorization:apiKey,
        },
    })
    .then((response)=>{
        console.log(response.data)
    })
    .catch((error)=>{
        console.error(error)
    })