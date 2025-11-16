import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6/dist/ethers.min.js";
let imageBase64 = null;

const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const submitBtn = document.getElementById("submitBtn");

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imageBase64 = reader.result;
    preview.style.display = "block";
    preview.style.backgroundImage = `url(${imageBase64})`;
    submitBtn.style.display = "inline-block";
  };
  reader.readAsDataURL(file);
};

const ABI = [
  "function mintNFT(address to, string tokenURI) public returns (uint256)"
];

submitBtn.onclick = async () => {
  
  const file = fileInput.files[0];
  if (!file) return alert("Select a file first");
  

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
    try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: "0xaa36a7" }]); 
    // 0xaa36a7 is 11155111 in hex
  } catch (switchError) {
    console.error("Could not switch network:", switchError);
  }
  const contract = new ethers.Contract("0x4FF850670C77D43c6BDa6Cdb837fF50F757e64A8", ABI, signer);
  const formData = new FormData();

  formData.append("file", file);


    const res = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (!data.url) return alert("Upload failed");
    try {
      const tx = await contract.mintNFT(signer.getAddress(), data.url); // send transaction
      const receipt = await tx.wait(); // wait for blockchain confirmation

  if (receipt.status === 1) {
    alert("NFT minted successfully!");
  } else {
    alert("NFT transaction failed!");
  }
} catch (err) {
  console.error("Error:", err);
  alert("Something went wrong: " + err.message);
}
    
  window.location = "mosaic";
};
