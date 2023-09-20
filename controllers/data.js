export const handleData = async (req,res) => {
    try {
        console.log("Request body: ", req.body);
        res.status(200).send("Hello from the server");
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}