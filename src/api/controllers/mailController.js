import nodemailer from 'nodemailer';

const sendMail = async (req, res) => {
    try {
        // Create a test account (only needed for development/testing)
        let testAccount = await nodemailer.createTestAccount();

        // Create a transporter
        const transporter = nodemailer.createTransport({
            service:'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'shubhamdasiitcs@gmail.com',
                pass: 'kuqimptzbndweacm'
            }
        });

        // Define email options
        let mailOptions = {
            from: {
                name:'bharat blinker',
            },
            to: "motofirstmy@gmail.com",                    // List of receivers
            subject: "Test Email",                          // Subject line
            text: "shubh!", // Plain text body
            html: "<b>das!</b>" // HTML body
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        // Respond to the client
        res.status(200).json({
            message: "Email sent successfully",
            messageId: info,
            previewURL: nodemailer.getTestMessageUrl(info)
        });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
};

export default sendMail;
