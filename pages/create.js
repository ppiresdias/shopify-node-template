import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import React, {useState, useCallback} from 'react';
import {Page, Card, Layout, FormLayout, TextField, PageActions, ColorPicker, hsbToRgb, Select, Toast, Frame} from '@shopify/polaris';
import store from 'store-js'
import ProductInfo from '../components/ProductInfo'
import axios from 'axios'
// import { setColor } from '@shopify/polaris/dist/types/latest/src/utilities/theme/utils';


export default function CreatePage() {
  const  [state, setState] = useState({
    modalOpen: false
  })

  const [formState, setFormState] = useState({
    title: '',
    percentage: '0'
  })

  const [textColor, setTextColor] = useState({
    color:{
      hue: 120,
      brightness: 1,
      saturation: 0,
    },
    rgbColor: {
      red: 255,
      green: 255,
      blue: 255
    }
    
  });

  // const handleTextColor = useCallback(setColor, []);

  function handleTextColor(color){
    let newRGBColor = hsbToRgb(color)
    let newState = {
      color: color,
      rgbColor: newRGBColor
    }
    console.log(newRGBColor)
    setTextColor(newState)
  }

  const [bgColor, setBgColor] = useState({
    color:{
      hue: 120,
      brightness: 0,
      saturation: 0,
    },
    rgbColor: {
      red: 0,
      green: 0,
      blue: 0
    }
    
  });

  // const handleTextColor = useCallback(setColor, []);

  function handleBgColor(color){
    let newRGBColor = hsbToRgb(color)
    let newState = {
      color: color,
      rgbColor: newRGBColor
    }
    console.log(newRGBColor)
    setBgColor(newState)
  }

  function handleText(name, text, id){
    console.log(formState)
    let newState = {
      [name]: text
    }
    setFormState({
      ...formState,
      ...newState
    })
    console.log({
      ...formState,
      ...newState
    })
  }

  function handleResourcePicker(resources) {
    const products = resources.selection.map((product)=> product.id)
    store.set('productIds', products)
    setState({modalOpen: false})
    console.log(store.get('productIds'))
  }

  const [selectedBannerLocation, setSelected] = useState('top');

  const handleBannerLocation = useCallback((value) => setSelected(value), []);

  const bannerLocationOptions = [
    {label: 'Top Of Page', value: 'top'},
    {label: 'Bottom Of Page', value: 'bottom'},
    {label: 'Custom', value: 'custom'}
  ]

  const [productInfoState, setProductInfoState] = useState({
    id: 'empty'
  });

  function showCustomCode(){
    return (
      <div>
        <p>Copy this code below</p>
        <pre>
            <code>&lt;div class=&quot;sale-banner-app&quot;&gt;&lt;/div&gt;</code>
        </pre>
      </div>
    )
  }

  const [toastActive, setToastActive] = useState(false);

  const toggleToastActive = () => setToastActive((active) => !active);

  const toastMarkup = toastActive ? (
    <Toast content="Message sent" onDismiss={toggleToastActive} />
  ) : null;

  return (
    <>
    <Frame>
      <Page
      breadcrumbs={[{content: 'Home', url: '/'}]}
      title="Shopify App"
      >
        <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico"/>
        </Head>
        <Layout>
            <Layout.AnnotatedSection
                title="Banner Information"
                description="Create a name for your banner"
                >
                <Card sectioned>
                <FormLayout>
                    <TextField label="Title" onChange={(text, id) => handleText('title', text, id)} 
                              value={formState.title} />
                    <TextField type="text" label="Sale Percentage" onChange={(text, id) => handleText('percentage', text, id)} 
                              value={formState.percentage} />

                    <div>
                      <div className="Polaris-Label">
                        <label id="Polaris-ColorPickerLabel" htmlFor="Polaris-ColorPicker" className="Polaris-Label__Text">Text Color</label>
                      </div>
                      <div style={{
                        display: "flex",

                      }}>
                        <ColorPicker onChange={handleTextColor} color={textColor.color} />
                        <div style={{
                              padding: '0 10px'
                            }}>
                            <div className="Polaris-Label">
                              <label id="Polaris-ColorPickerLabel" htmlFor="Polaris-ColorPicker" className="Polaris-Label__Text">Selected Text Color</label>
                            </div>
                            <div style={{
                              width: '100px',
                              height: '40px',
                              border: '1px solid black',
                              backgroundColor: `rgba(${textColor.rgbColor.red}, ${textColor.rgbColor.green}, ${textColor.rgbColor.blue})`
                            }}/>
                        </div>
                      </div>

                    </div>

                    <div>
                      <div className="Polaris-Label">
                        <label id="Polaris-ColorPickerLabel" htmlFor="Polaris-ColorPicker" className="Polaris-Label__Text">Background Color</label>
                      </div>
                      <div style={{
                        display: "flex",

                      }}>
                        <ColorPicker onChange={handleBgColor} color={bgColor.color} />
                        <div style={{
                              padding: '0 10px'
                            }}>
                            <div className="Polaris-Label">
                              <label id="Polaris-ColorPickerLabel" htmlFor="Polaris-ColorPicker" className="Polaris-Label__Text">Selected Bg Color</label>
                            </div>
                            <div style={{
                              width: '100px',
                              height: '40px',
                              border: '1px solid black',
                              backgroundColor: `rgba(${bgColor.rgbColor.red}, ${bgColor.rgbColor.green}, ${bgColor.rgbColor.blue})`
                            }}/>
                        </div>
                      </div>

                    </div>
                    
                    
                </FormLayout>
                </Card>
            </Layout.AnnotatedSection>
            <ProductInfo setProductInfoState={setProductInfoState}/>

            <Layout.AnnotatedSection
                title="Banner Location"
                description="Choose where you want the banner to show"
                >
                <Card sectioned>
                <Select
                  label="Location"
                  options={bannerLocationOptions}
                  onChange={handleBannerLocation}
                  value={selectedBannerLocation}
                />
                {selectedBannerLocation == 'custom' ? showCustomCode() : ''}
                </Card>
            </Layout.AnnotatedSection>
            <Layout.Section>
              <Card title="Banner Preview" sectioned>
                <div style={{
                  width: '100%',
                  display: 'flex'
                }}>
                  <div style={{
                    maxWidth: '1200px',
                    width: '100%',
                    display: 'flex',
                    padding: '40px 20px',
                    background: `rgba(${bgColor.rgbColor.red}, ${bgColor.rgbColor.green},${bgColor.rgbColor.blue},1)`
                  }}>
                    <div style={{
                      width: '200px',
                      display:'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      flexGrow: 1
                    }}>
                      <img style={{
                        width: '200px'
                      }} src={`${productInfoState.id = 'empty' ? '' : productInfoState.image_url}`}/>
                      <div style={{
                        width: '100%',
                        display:'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        color: `rgba(${textColor.rgbColor.red}, ${textColor.rgbColor.green},${textColor.rgbColor.blue},1)`
                      }}>
                        <h2 style={{
                          fontSize: '3rem',
                          marginBottom: '1.5rem',
                          fontWeight: '700'
                        }}>{formState.title}</h2>
                        <span style={{
                          fontSize: '5rem'
                        }}>{formState.percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Layout.Section>
            {toastMarkup}
        </Layout>

        <PageActions
            primaryAction={{
                content: 'Save',
                onAction: () => {
                  console.log(`=======================================`)
                  const savedData = {
                    title: formState,
                    percentage: formState.percentage,
                    textColor: textColor.rgbColor,
                    bgColor: bgColor.rgbColor,
                    bannerLocation: selectedBannerLocation,
                    productInfo: productInfoState
                  }
                  console.log(savedData)
                  axios.post('/api/banners', {
                    data: savedData
                  })
                  .then(function (response){
                    console.log(response)
                    toggleToastActive()
                  }).catch(function (error){
                    console.log(error)
                  })
                }
            }}
            secondaryActions={[
                {
                content: 'Delete',
                destructive: true,
                },
            ]}
        />
      </Page>
      </Frame>
    </>
  )
}