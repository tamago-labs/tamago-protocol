 
export default async function handler(req, res) {

    if (req.method !== "POST") {
        res.status(405).send({ message: 'Only POST requests allowed' })
    }

    const response = await fetch(`https://api.tamagonft.xyz/v1/account`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
    });
    const json = await response.json();

    // Rest of the API logic
    res.json({ ...json })
}