import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, FormEvent, ChangeEvent } from 'react';

const SetupPage: NextPage = () => {
  const [ address, setAddress ] = useState( '' );

  const onChangeAddress = ( e: ChangeEvent<HTMLInputElement> ) => {
    setAddress( e.target.value );
  }

  const onSubmit = async ( e: FormEvent<HTMLFormElement> ) => {
    e.preventDefault();

    const response = await fetch( '/api/setup?url=' + encodeURI( address ) );
    const json = await response.json();
    console.log( 'parsed: ', json );
  }

  return (
    <div>
      <h1>Here we will setup our page</h1>

      <form onSubmit={ onSubmit }>
        <input type="text" name="address" id="address" value={ address } onChange={ onChangeAddress }/>

        <button type="submit">Setup library</button>
      </form>
    </div>
  )
}

export default SetupPage
