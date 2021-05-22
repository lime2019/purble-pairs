<template>
  <div id="app">
    <el-button type="primary">主要按钮</el-button>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
  html{
    height: 100%;
  }
  body{
    margin: 0;
    height: 100%;
  }
</style>
