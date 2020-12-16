import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import React, {useState, useCallback, Fragment} from 'react';
import {Button, Card, Layout, Heading, FormLayout, TextField, MediaCard, PageActions, ColorPicker, hsbToRgb} from '@shopify/polaris';
import {ResourcePicker} from '@shopify/app-bridge-react'
import store from 'store-js'
import { gql, useQuery } from '@apollo/client'

// GraphQL API route to fetch product information
const GET_PRODUCTS = gql`
    query getProducts($ids: [ID!]!){
        nodes(ids: $ids){
        ...on Product{
            title
            handle
            description
            id
            images(first: 1){
            edges{
                node{
                originalSrc
                altText
                }
            }
            }
            variants(first: 1){
            edges{
                node{
                price
                id
                }
            }
            }
        }
        }
    }
`;


export default function ProductInfo(props){
    const  [state, setState] = useState({
        modalOpen: false
    })

    const  [productChosen, setProductChosen] = useState(false)

    function handleResourcePicker(resources) {
        const products = resources.selection.map((product)=> product.id)
        store.set('productIds', products)
        setState({modalOpen: false})
        setProductChosen(true)

        const product = resources.selection[0]

        props.setProductInfoState({
            id: product.id,
            title: product.title,
            description: product.descriptionHtml,
            image_url: product.images[0].originalSrc 
        })
        console.log(`====================================Selection`)
        
        console.log(product)
    }

    const { loading, error, data } = useQuery(GET_PRODUCTS, {
        variables: {
            "ids": store.get('productIds')
          }
      });
      console.log(data)
    // if (loading) return <p>Loading ...</p>;
    // console.log(data)
    // return <h1>Loaded Data Complete</h1>;

    function showMediaCard() {
        if(productChosen) {
            if(loading){
                return (<div>Loading Product...</div>)
            }else{
                const product = {
                    title: data.nodes[0].title,
                    description: data.nodes[0].description,
                    image_url: data.nodes[0].images.edges[0].node.originalSrc
                }
                return (
                    <MediaCard
                            title={product.title}
                            primaryAction={{
                                content: 'Change Product',
                                onAction: () => {setState({modalOpen:true})},
                            }}
                            description={product.description}
                            popoverActions={[{content: 'Dismiss', onAction: () => {}}]}
                            >
                            <img
                                alt=""
                                width="100%"
                                height="100%"
                                style={{
                                  objectFit: 'cover',
                                  objectPosition: 'center',
                                }}
                                src={product.image_url}
                            />
                        </MediaCard>
                )
            }
        }
    
    }
    return (
        <>
            <ResourcePicker resourceType="Product"
                        open={state.modalOpen}
                        onCancel={() => setState({modalOpen: false})}
                        showVariants={false}
                        onSelection={(resources)=> handleResourcePicker(resources)}
            />
            <Layout.AnnotatedSection
                title="Product Information"
                description=""
                >
                <Card sectioned>
                    {!productChosen ? <Button onClick={()=>{setState({modalOpen:true})}}>Choose A Product</Button>: ''}  
                    
                    {showMediaCard()}
                </Card>
            </Layout.AnnotatedSection>
        </>
    )
}