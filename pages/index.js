import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import React, {useState} from 'react';
import {Page, EmptyState, Layout, Link as PLink} from '@shopify/polaris';
import store from 'store-js'
import { useRouter } from 'next/router'

export default function Home() {

  const router = useRouter()
  
  function clickedStart(){
    router.push('/create')
  }

  return (
    <>
      <Page>
          <Head>
            <title>Create Next App</title>
            <link rel="icon" href="/favicon.ico"/>
          </Head>
          <Layout>
            <Layout.Section>
                <EmptyState
                  heading="Sample Shopify App"
                  action={ {content: 'Start', onAction: () => clickedStart() } }
                  secondaryAction={{content: 'Learn more', url: 'https://help.shopify.com'}}
                  image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
                >
                  <p>This is a sample shopify application</p>
              </EmptyState>
            </Layout.Section>
          </Layout>
      </Page>
    </>
  )
}

