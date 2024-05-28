import nodemailer from 'nodemailer';

const sendMail = async (req, res) => {
    try {
        // Create a test account (only needed for development/testing)
        let testAccount = await nodemailer.createTestAccount();

        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'cara31@ethereal.email',
                pass: 'urguAkR7MzSgWnmkkU'
            }
        });

        // Define email options
        let mailOptions = {
            from: '"Test Sender" <shubhamdasiitcs@gmail.com>', // Sender address
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
