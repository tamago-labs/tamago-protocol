import React, { useState, useEffect, useCallback, useReducer, useRef } from "react";
import styled from "styled-components";
import { Puff } from "react-loading-icons"
import { useWeb3React } from "@web3-react/core";
import { Flex, Box } from "reflexbox"
import { NFTStorage } from "nft.storage";
import axios from "axios"
import { Button } from "../button"
import { X } from "react-feather"
import {
  Label,
  Input,
  Select,
  Textarea,
  Radio,
  Checkbox,
} from '@rebass/forms'
import { NFT_STORAGE_TOKEN } from "../../constants"
import { slugify } from "../../helper"

const Wrapper = styled.div.attrs(() => ({
}))`   

  padding: 10px;
  margin-bottom: 3rem;

  h2 {
    padding: 0px;
    margin: 0px;
    margin-top: 10px;
  }

  p {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  hr {
    background: white;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .error-message {
    margin-left: 10px;
    font-size: 14px;
    color: var(--danger);
  }
`;

const Disclaimer = styled.div`
    font-size: 14px;
    line-height: 20px;
    padding: 0px;
    border: 1px solid white;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
`

const Body = styled.div`
    border: 1px solid white;
    border-radius: 5px; 
    margin-top: 20px;
    padding: 20px;
    padding-top: 40px;
`

const HasNoPicture = styled.div`
  border: 1px solid white;
  border-radius: 50%;
  height: 80px;
  width: 80px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  padding: 3px;
  cursor: pointer;
  div {
    margin: auto;
    font-size: 12px;
    text-align: center;
  }
`

const HasPicture = styled.div` 
  border-radius: 50%;
  height: 80px;
  width: 80px;
  margin-left: auto;
  margin-right: auto;
  override: hidden; 
  img {
    width: 100%;
  }
`

const ImageProfileContainer = styled(Flex)`
  height: 100px;
  display: flex; 
`


const fileToDataUri = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    resolve(event.target.result)
  };
  reader.readAsDataURL(file);
})

const ImageProfile = ({
  onChange,
  image,
  onRemove
}) => {

  const inputFile = useRef(null)

  const [loading, setLoading] = useState(false)


  const onButtonClick = () => {
    inputFile.current.click();
  };

  const onImageChoose = async (e) => {
    const { name, files } = e.target
    const data = files[0]

    if (!data) {
      return;
    }

    setLoading(true)

    const dataUri = await fileToDataUri(data)
    const blob = await (await fetch(dataUri)).blob();

    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
    const cid = await client.storeBlob(blob);

    const imageUrl = `https://nftstorage.link/ipfs/${cid}`

    onChange(imageUrl)
    setLoading(false)
  }

  return (
    <>
      <ImageProfileContainer pb={1}>

        <input type='file' onChange={onImageChoose} accept="image/*" id='file' ref={inputFile} style={{ display: 'none' }} />

        {loading && (
          <div style={{ marginLeft: "auto", marginRight: "auto", justifyContent: "center", textAlign: "center", padding: "3rem", display: "flex", flexDirection: "row" }}>
            <div style={{ margin: "auto", display: "flex", flexDirection: "row" }}>
              <Puff height="24px" />
            </div>
          </div>
        )}

        {(!image && !loading) &&
          (
            <HasNoPicture onClick={onButtonClick}>
              <div>
                Upload Profile Image
              </div>
            </HasNoPicture>
          )
        }

        {(image && !loading) &&
          (
            <>
              <HasPicture>
                <img src={image} alt="" />
              </HasPicture>
            </>
          )
        }

      </ImageProfileContainer>
      {(image && !loading) && <div onClick={onRemove} style={{ padding: "0px", fontSize: "12px", textAlign: "center", textDecoration: "underline", cursor: "pointer" }}>Remove</div>}
    </>

  )
}

const Profile = () => {

  const { account, library } = useWeb3React()

  const [checking, setChecking] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [values, dispatch] = useReducer(
    (curVal, newVal) => ({ ...curVal, ...newVal }),
    {
      alias: "",
      image: "",
      description: "",
      location: "",
      collections: []
    }
  )

  useEffect(() => {
    if (account) {
      axios.get(`https://api.tamagonft.xyz/v1/account/${account}`).then(
        ({ data }) => {
          dispatch({
            alias: data.alias,
            description: data.description,
            image: data.image,
            location: data.location,
            collections: data.collections
          })
        }
      ).finally(() => {
        setChecking(false)
      })
    }
  }, [account])

  const {
    alias,
    image,
    description,
    location,
    collections
  } = values

  const handleTextChange = (e) => {
    const { name, value } = e.target
    dispatch({ [name]: value })
  }

  const handleImageChange = (imageUrl) => {
    dispatch({ image: imageUrl })
  }

  const onRemoveImage = () => {
    dispatch({ image: "" })
  }

  const onSave = useCallback(async () => {

    const { alias, image,
      description,
      location,
      collections } = values

    if (!alias) {
      alert("Please provide Alias")
      return
    }

    setSaving(true)

    try {
      const message = "Please sign this message to update your profile creator"

      const signature = await library.getSigner().signMessage(message)

      const payload = {
        address: account,
        alias,
        slug: slugify(alias),
        image,
        description,
        location,
        collections,
        signature,
        message
      }

      await axios.post(`/api/account`, payload)

      setSaved(true)

    } catch (e) {
      alert(e.message)
    }

    setSaving(false)
  }, [values, library])

  const onCollectionChange = useCallback((index, key, value) => {
    collections[index][key] = value
    dispatch({ collections: collections })
  }, [collections])

  const onNewCollection = useCallback(() => {
    if (collections.length > 4) {
      return
    }
    dispatch({ collections: [...collections, { platform: "", url: "" }] })
  }, [collections])

  const onRemoveCollection = useCallback((index) => {
    dispatch({ collections: collections.filter((item, i) => i !== index) })
  }, [collections])

  return (
    <Wrapper>
      <h2>Creator Profile</h2>
      <hr />
      <Disclaimer>
        <ul>
          <li>Your creator profile will be displayed on every collection pages you made and will be publicly visible make sure you're not sharing anything you don't want to</li>
          <li>When the profile is set, your account can accept the follower</li>
        </ul>
      </Disclaimer>

      {checking
        ?
        <div style={{ marginLeft: "auto", marginRight: "auto", justifyContent: "center", textAlign: "center", padding: "3rem", display: "flex", flexDirection: "row" }}>
          <div style={{ margin: "auto", display: "flex", flexDirection: "row" }}>
            <Puff height="24px" />{` `}Checking Profile...
          </div>
        </div>
        :
        <Body>

          <ImageProfile
            image={image}
            onChange={handleImageChange}
            onRemove={onRemoveImage}
          />

          <Flex pb={1}>
            <Box width={1} >
              <Label p={2} htmlFor='Alias'>Alias</Label>
              <Input
                value={alias}
                id='alias'
                name='alias'
                type='text'
                placeholder='Tanya'
                onChange={handleTextChange}
              />
            </Box>
          </Flex>
          <Flex pb={1}>
            <Box width={1} >
              <Label p={2} htmlFor='comment'>Short Description</Label>
              <Textarea
                value={description}
                id='description'
                name='description'
                onChange={handleTextChange}
                placeholder="Tanya is a gentle physics student who is addicted to social media. Physically, she is built like a stick. She strongly dislikes her neighbour. She is particularly interested in escaping from oppression."
              />
            </Box>
          </Flex>
          <Flex pb={1}>
            <Box width={1} >
              <Label p={2} htmlFor='Location'>Location</Label>
              <Input
                value={location}
                id='location'
                name='location'
                type='text'
                onChange={handleTextChange}
                placeholder='Bangkok, Thailand'
              />
            </Box>
          </Flex>
          <Flex >
            <Box width={1} >
              <Label p={2} htmlFor='Location'>External Collections</Label>
            </Box>
          </Flex>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {collections.map((col, index) => {
              return (
                <Flex>
                  <Box width={3 / 12} >
                    <Label p={2} htmlFor='Location'>Platform</Label>
                    <Input
                      id='Platform'
                      name='Platform'
                      type='text'
                      value={col['platform']}
                      onChange={(e) => onCollectionChange(index, "platform", e.target.value)}
                      placeholder='Opensea'
                    />
                  </Box>
                  <Box pl={1} width={8 / 12} >
                    <Label p={2} htmlFor='Location'>URL</Label>
                    <Input
                      id='URL'
                      name='URL'
                      type='text'
                      value={col['url']}
                      onChange={(e) => onCollectionChange(index, "url", e.target.value)}
                      placeholder='https://opensea.io/collection/neowft'
                    />
                  </Box>
                  <Box pl={1} width={1 / 12} >
                    <div onClick={() => onRemoveCollection(index)} style={{ marginTop: "38px", cursor: "pointer" }}>
                      <X size={24} />
                    </div>
                  </Box>
                </Flex>
              )
            })}
          </div>
          <Button style={{ marginTop: "10px" }} onClick={onNewCollection}>+ Collection</Button>
          <hr />
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Button disabled={saving} onClick={onSave}>
              {saving && (
                <Puff height="18px" style={{ marginRight: "3px" }} stroke="black" width="18px" />
              )}
              <div>
                Save Changes
              </div>
            </Button>
            {` `}{
              saved && (
                <div style={{ fontSize: "14px", marginLeft: "10px", marginTop: "auto", marginBottom: "auto" }}>
                  <b>
                    Saved
                  </b>
                </div>
              )
            }
          </div>
        </Body>

      }


    </Wrapper>
  )
}

export default Profile