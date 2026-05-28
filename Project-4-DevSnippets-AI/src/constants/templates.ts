// ============================================================
// DevNest — Language Templates Boilerplates
// ============================================================
import { Language } from '@/types/snippet.types';

export interface TemplateConfig {
  id: string;
  title: string;
  description: string;
  language: Language;
  tag: string;
  content: string;
}

export const TEMPLATES: TemplateConfig[] = [
  { 
    id: 'tpl-react-fc', 
    title: 'React Functional Component', 
    description: 'React Native functional component with props and StyleSheet in TypeScript', 
    language: 'TypeScript', 
    tag: 'TypeScript',
    content: "import React from 'react';\\nimport { View, Text, StyleSheet } from 'react-native';\\n\\ninterface Props {\\n  title: string;\\n}\\n\\nexport const MyComponent = ({ title }: Props) => {\\n  return (\\n    <View style={styles.container}>\\n      <Text style={styles.text}>{title}</Text>\\n    </View>\\n  );\\n};\\n\\nconst styles = StyleSheet.create({\\n  container: {\\n    flex: 1,\\n    justifyContent: 'center',\\n    alignItems: 'center',\\n    backgroundColor: '#000',\\n  },\\n  text: {\\n    color: '#fff',\\n    fontSize: 16,\\n  },\\n});"
  },
  { 
    id: 'tpl-js-express', 
    title: 'Express Router API Endpoint', 
    description: 'API Route controller setup with error handling middleware', 
    language: 'JavaScript', 
    tag: 'JavaScript',
    content: "const express = require('express');\\nconst router = express.Router();\\n\\nrouter.get('/api/v1/users', async (req, res, next) => {\\n  try {\\n    const users = await db.users.findMany();\\n    res.status(200).json({ success: true, data: users });\\n  } catch (error) {\\n    next(error);\\n  }\\n});\\n\\nmodule.exports = router;"
  },
  {
    id: 'tpl-py-flask',
    title: 'Flask API Server skeleton',
    description: 'Basic Python Flask web application server configuration',
    language: 'Python',
    tag: 'Python',
    content: "from flask import Flask, jsonify, request\\n\\napp = Flask(__name__)\\n\\n@app.route('/api/greet', methods=['POST'])\\ndef greet_user():\\n    data = request.get_json() or {}\\n    name = data.get('name', 'Developer')\\n    return jsonify({\"message\": f\"Hello, {name}!\", \"status\": \"success\"})\\n\\nif __name__ == '__main__':\\n    app.run(port=5000, debug=True)"
  },
  {
    id: 'tpl-java-main',
    title: 'Java Main Entry Class',
    description: 'Java boilerplate starting point with arguments handler',
    language: 'Java',
    tag: 'Java',
    content: "public class Main {\\n    public static void main(String[] args) {\\n        System.out.println(\"Hello World!\");\\n        for (int i = 0; i < args.length; i++) {\\n            System.out.println(\"Argument \" + i + \": \" + args[i]);\\n        }\\n    }\\n}"
  },
  {
    id: 'tpl-csharp-async',
    title: 'C# Async Main Application',
    description: 'Modern async Task Main method in C# Console Application',
    language: 'C#',
    tag: 'C#',
    content: "using System;\\nusing System.Threading.Tasks;\\n\\nnamespace DevNestApp\\n{\\n    class Program\\n    {\\n        static async Task Main(string[] args)\\n        {\\n            Console.WriteLine(\"Starting async task...\");\\n            await Task.Delay(1000);\\n            Console.WriteLine(\"Task completed!\");\\n        }\\n    }\\n}"
  },
  {
    id: 'tpl-cpp-oop',
    title: 'C++ OOP Class Definition',
    description: 'Standard C++ Object Oriented programming setup with header-like syntax',
    language: 'C++',
    tag: 'C++',
    content: "#include <iostream>\\n#include <string>\\n\\nclass Developer {\\nprivate:\\n    std::string name;\\n    int experience;\\npublic:\\n    Developer(std::string devName, int exp) : name(devName), experience(exp) {}\\n\\n    void displayInfo() const {\\n        std::cout << \"Name: \" << name << \", Experience: \" << experience << \" years\" << std::endl;\\n    }\\n};\\n\\nint main() {\\n    Developer dev(\"DevNest\", 3);\\n    dev.displayInfo();\\n    return 0;\\n}"
  },
  {
    id: 'tpl-c-struct',
    title: 'C Struct & Pointers',
    description: 'Demonstrating structs, pointers, and memory references in C',
    language: 'C',
    tag: 'C',
    content: "#include <stdio.h>\\n#include <stdlib.h>\\n\\ntypedef struct {\\n    int x;\\n    int y;\\n} Point;\\n\\nint main() {\\n    Point* p = (Point*)malloc(sizeof(Point));\\n    if (p == NULL) return 1;\\n    \\n    p->x = 10;\\n    p->y = 20;\\n    \\n    printf(\"Point coordinates: (%d, %d)\\\\n\", p->x, p->y);\\n    free(p);\\n    return 0;\\n}"
  },
  {
    id: 'tpl-go-http',
    title: 'Go HTTP Server Handler',
    description: 'Native HTTP routing multiplexer service setup in Go',
    language: 'Go',
    tag: 'Go',
    content: "package main\\n\\nimport (\\n\\t\"fmt\"\\n\\t\"net/http\"\\n)\\n\\nfunc mainHandler(w http.ResponseWriter, r *http.Request) {\\n\\tfmt.Fprintf(w, \"Welcome to Go API!\")\\n}\\n\\nfunc main() {\\n\\tmux := http.NewServeMux()\\n\\tmux.HandleFunc(\"/\", mainHandler)\\n\\n\\tfmt.Println(\"Server running on :8080\")\\n\\thttp.ListenAndServe(\":8080\", mux)\\n}"
  },
  {
    id: 'tpl-rust-fs',
    title: 'Rust Result Error Handling',
    description: 'Idiomatic result types and error handling in Rust',
    language: 'Rust',
    tag: 'Rust',
    content: "use std::fs::File;\\nuse std::io::{self, Read};\\n\\nfn read_file() -> Result<String, io::Error> {\\n    let mut file = File::open(\"hello.txt\")?;\\n    let mut contents = String::new();\\n    file.read_to_string(&mut contents)?;\\n    Ok(contents)\\n}\\n\\nfn main() {\\n    match read_file() {\\n        Ok(text) => println!(\"File: {}\", text),\\n        Err(e) => eprintln!(\"Error: {}\", e),\\n    }\\n}"
  },
  {
    id: 'tpl-php-pdo',
    title: 'PHP PDO Database Query',
    description: 'Secure prepared statement execution with PDO in PHP',
    language: 'PHP',
    tag: 'PHP',
    content: "<?php\\n$dsn = \"mysql:host=localhost;dbname=devnest;charset=utf8mb4\";\\n$options = [\\n    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,\\n    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\\n];\\ntry {\\n     $pdo = new PDO($dsn, \"user\", \"pass\", $options);\\n     $stmt = $pdo->prepare(\"SELECT * FROM users WHERE id = :id\");\\n     $stmt->execute(['id' => 1]);\\n     $results = $stmt->fetchAll();\\n     echo json_encode($results);\\n} catch (\\\\PDOException $e) {\\n     echo \"Database error: \" . $e->getMessage();\\n}"
  },
  {
    id: 'tpl-ruby-class',
    title: 'Ruby Class Definition',
    description: 'Basic Ruby class with initializer and attr_accessor',
    language: 'Ruby',
    tag: 'Ruby',
    content: "class Developer\\n  attr_accessor :name, :language\\n\\n  def initialize(name, language)\\n    @name = name\\n    @language = language\\n  end\\n\\n  def code\\n    puts \"#{@name} is coding in #{@language}!\"\\n  end\\nend\\n\\ndev = Developer.new(\"DevNest\", \"Ruby\")\\ndev.code"
  },
  {
    id: 'tpl-swiftui-view',
    title: 'SwiftUI View Boilerplate',
    description: 'Basic SwiftUI view structure with dynamic state controls',
    language: 'Swift',
    tag: 'Swift',
    content: "import SwiftUI\\n\\nstruct DevNestView: View {\\n    @State private var isActive: Bool = false\\n\\n    var body: some View {\\n        VStack(spacing: 20) {\\n            Text(\"SwiftUI View\")\\n                .font(.title)\\n                .foregroundColor(isActive ? .green : .primary)\\n            \\n            Button(action: {\\n                isActive.toggle()\\n            }) {\\n                Text(\"Toggle State\")\\n                    .padding()\\n                    .background(Color.blue)\\n                    .foregroundColor(.white)\\n                    .cornerRadius(10)\\n            }\\n        }\\n    }\\n}"
  },
  {
    id: 'tpl-kotlin-android',
    title: 'Kotlin Data Class & Extensions',
    description: 'Kotlin idiomatic data class and extension functions',
    language: 'Kotlin',
    tag: 'Kotlin',
    content: "package com.devnest.utils\\n\\ndata class User(val id: Int, val name: String, val isActive: Boolean = true)\\n\\nfun List<User>.getActiveUsers(): List<User> {\\n    return this.filter { it.isActive }\\n}\\n\\nfun main() {\\n    val users = listOf(\\n        User(1, \"Alice\"),\\n        User(2, \"Bob\", false),\\n        User(3, \"Charlie\")\\n    )\\n    \\n    println(\"Active users: \\${users.getActiveUsers().map { it.name }}\")\\n}"
  },
  {
    id: 'tpl-dart-widget',
    title: 'Dart Flutter Stateless Widget',
    description: 'Standard Material Flutter widget template',
    language: 'Dart',
    tag: 'Dart',
    content: "import 'package:flutter/material.dart';\\n\\nclass HomeWidget extends StatelessWidget {\\n  const HomeWidget({Key? key}) : super(key: key);\\n\\n  @override\\n  Widget build(BuildContext context) {\\n    return Container(\\n      padding: const EdgeInsets.all(16.0),\\n      child: const Text(\\n        'Welcome to Flutter!',\\n        style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold),\\n      ),\\n    );\\n  }\\n}"
  },
  {
    id: 'tpl-sql-join',
    title: 'SQL Join & Aggregate Query',
    description: 'Advanced relational SQL select query with JOIN and GROUP BY',
    language: 'SQL',
    tag: 'SQL',
    content: "SELECT \\n  users.id, \\n  users.name,\\n  COUNT(orders.id) AS total_orders,\\n  SUM(orders.amount) AS total_spent\\nFROM users\\nLEFT JOIN orders ON users.id = orders.user_id\\nWHERE users.status = 'active'\\nGROUP BY users.id, users.name\\nHAVING total_spent > 100\\nORDER BY total_spent DESC\\nLIMIT 10;"
  },
  {
    id: 'tpl-html-skeleton',
    title: 'HTML5 Skeleton',
    description: 'Boilerplate HTML5 document setup',
    language: 'HTML',
    tag: 'HTML',
    content: "<!DOCTYPE html>\\n<html lang=\"en\">\\n<head>\\n    <meta charset=\"UTF-8\">\\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\\n    <title>Web App</title>\\n    <link rel=\"stylesheet\" href=\"styles.css\">\\n</head>\\n<body>\\n    <main id=\"app\">\\n        <h1>Hello World!</h1>\\n    </main>\\n    <script src=\"app.js\"></script>\\n</body>\\n</html>"
  },
  {
    id: 'tpl-css-grid',
    title: 'CSS Grid & Flexbox Center',
    description: 'Modern CSS standard properties for center positioning layouts',
    language: 'CSS',
    tag: 'CSS',
    content: ":root {\\n  --primary: #3498db;\\n  --bg: #121212;\\n}\\n\\nbody {\\n  margin: 0;\\n  background-color: var(--bg);\\n  color: #fff;\\n}\\n\\n.flex-center {\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n  min-height: 100vh;\\n}\\n\\n.grid-container {\\n  display: grid;\\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\\n  gap: 20px;\\n  padding: 20px;\\n}"
  },
  {
    id: 'tpl-shell-deploy',
    title: 'Shell Script Deploy',
    description: 'Automated bash deployment file with directory checks',
    language: 'Shell',
    tag: 'Shell',
    content: "#!/bin/sh\\n\\necho \"🚀 Starting Deploy script...\"\\n\\nif [ ! -d \"node_modules\" ]; then\\n  echo \"Installing dependencies...\"\\n  npm install\\nfi\\n\\necho \"Running build...\"\\nnpm run build\\n\\necho \"✅ Done!\""
  },
  {
    id: 'tpl-bash-script',
    title: 'Bash Script Variables & Loops',
    description: 'Bash scripting with arguments, variables, and loops',
    language: 'Bash',
    tag: 'Bash',
    content: "#!/bin/bash\\n\\n# Exit on error\\nset -e\\n\\nPROJECT_NAME=\\${1:-\"my_project\"}\\n\\necho \"Setting up \\$PROJECT_NAME...\"\\n\\nfor i in {1..3}; do\\n  echo \"Step \\$i...\"\\n  sleep 1\\ndone\\n\\necho \"Setup complete for \\$PROJECT_NAME!\""
  },
  {
    id: 'tpl-powershell-script',
    title: 'PowerShell Automation',
    description: 'PowerShell script with parameters and file operations',
    language: 'PowerShell',
    tag: 'PowerShell',
    content: "param (\\n    [string]\\$Directory = \".\\\\\\\\logs\",\\n    [int]\\$DaysOld = 7\\n)\\n\\nWrite-Host \"Cleaning up logs older than \\$DaysOld days in \\$Directory\" -ForegroundColor Cyan\\n\\nif (!(Test-Path \\$Directory)) {\\n    Write-Warning \"Directory does not exist!\"\\n    exit\\n}\\n\\nGet-ChildItem -Path \\$Directory -Filter \"*.log\" |\\n    Where-Object { \\$_.LastWriteTime -lt (Get-Date).AddDays(-\\$DaysOld) } |\\n    Remove-Item -Force -Verbose\\n\\nWrite-Host \"Done!\" -ForegroundColor Green"
  },
  {
    id: 'tpl-markdown-readme',
    title: 'Markdown Readme Template',
    description: 'Professional GitHub repository README structure outline',
    language: 'Markdown',
    tag: 'Markdown',
    content: "# Project Title\\n\\n> A short, catchy description of your project.\\n\\n## Features\\n- 🚀 Fast performance\\n- 🛡️ Type-safe\\n- 🎨 Modern UI\\n\\n## Installation\\n\\n```bash\\nnpm install my-project\\n```\\n\\n## Usage\\n\\n```javascript\\nimport { init } from 'my-project';\\ninit();\\n```\\n\\n## License\\nMIT"
  },
  {
    id: 'tpl-json-config',
    title: 'JSON Config Schema',
    description: 'Standard settings configuration mapping schema',
    language: 'JSON',
    tag: 'JSON',
    content: "{\\n  \"name\": \"devnest-app\",\\n  \"version\": \"1.0.0\",\\n  \"private\": true,\\n  \"scripts\": {\\n    \"start\": \"expo start\",\\n    \"build\": \"expo build\"\\n  },\\n  \"dependencies\": {\\n    \"react\": \"18.2.0\"\\n  }\\n}"
  },
  {
    id: 'tpl-yaml-ci',
    title: 'YAML GitHub Actions',
    description: 'GitHub Actions CI/CD pipeline configuration in YAML',
    language: 'YAML',
    tag: 'YAML',
    content: "name: CI Pipeline\\n\\non:\\n  push:\\n    branches: [ main ]\\n  pull_request:\\n    branches: [ main ]\\n\\njobs:\\n  build:\\n    runs-on: ubuntu-latest\\n    steps:\\n    - uses: actions/checkout@v3\\n    - name: Use Node.js\\n      uses: actions/setup-node@v3\\n      with:\\n        node-version: '18.x'\\n    - run: npm ci\\n    - run: npm test"
  },
  {
    id: 'tpl-graphql-schema',
    title: 'GraphQL Schema Definition',
    description: 'Type definitions for a GraphQL API schema',
    language: 'GraphQL',
    tag: 'GraphQL',
    content: "type User {\\n  id: ID!\\n  name: String!\\n  email: String!\\n  posts: [Post!]!\\n}\\n\\ntype Post {\\n  id: ID!\\n  title: String!\\n  content: String\\n  author: User!\\n}\\n\\ntype Query {\\n  users: [User!]!\\n  user(id: ID!): User\\n  posts: [Post!]!\\n}\\n\\ntype Mutation {\\n  createUser(name: String!, email: String!): User!\\n}"
  },
  {
    id: 'tpl-vue-sfc',
    title: 'Vue Single File Component',
    description: 'Vue 3 Composition API setup script',
    language: 'Vue',
    tag: 'Vue',
    content: "<script setup>\\nimport { ref, computed } from 'vue'\\n\\nconst count = ref(0)\\nconst double = computed(() => count.value * 2)\\n\\nfunction increment() {\\n  count.value++\\n}\\n</script>\\n\\n<template>\\n  <div class=\"card\">\\n    <h2>Count: {{ count }}</h2>\\n    <p>Double: {{ double }}</p>\\n    <button @click=\"increment\">Increment</button>\\n  </div>\\n</template>\\n\\n<style scoped>\\n.card {\\n  padding: 20px;\\n  border-radius: 8px;\\n  background: #f5f5f5;\\n}\\n</style>"
  },
  {
    id: 'tpl-svelte-comp',
    title: 'Svelte Component',
    description: 'Svelte reactive component with styles',
    language: 'Svelte',
    tag: 'Svelte',
    content: "<script>\\n  let count = 0;\\n  \\n  function handleClick() {\\n    count += 1;\\n  }\\n</script>\\n\\n<main>\\n  <h1>Count: {count}</h1>\\n  <button on:click={handleClick}>\\n    Click me\\n  </button>\\n</main>\\n\\n<style>\\n  main {\\n    text-align: center;\\n    padding: 1em;\\n  }\\n  button {\\n    background: #ff3e00;\\n    color: white;\\n    border: none;\\n    padding: 10px 20px;\\n  }\\n</style>"
  },
  {
    id: 'tpl-dockerfile',
    title: 'Dockerfile Node.js',
    description: 'Multi-stage build Dockerfile for Node apps',
    language: 'Dockerfile',
    tag: 'Dockerfile',
    content: "FROM node:18-alpine AS builder\\nWORKDIR /app\\nCOPY package*.json ./\\nRUN npm ci\\nCOPY . .\\nRUN npm run build\\n\\nFROM node:18-alpine\\nWORKDIR /app\\nCOPY --from=builder /app/dist ./dist\\nCOPY package*.json ./\\nRUN npm ci --only=production\\nEXPOSE 3000\\nCMD [\"npm\", \"start\"]"
  },
  {
    id: 'tpl-solidity-contract',
    title: 'Solidity Smart Contract',
    description: 'Basic Ethereum smart contract with mapping and events',
    language: 'Solidity',
    tag: 'Solidity',
    content: "// SPDX-License-Identifier: MIT\\npragma solidity ^0.8.19;\\n\\ncontract SimpleStorage {\\n    uint256 private storedData;\\n    \\n    event DataStored(uint256 newValue);\\n    \\n    function set(uint256 x) public {\\n        storedData = x;\\n        emit DataStored(x);\\n    }\\n    \\n    function get() public view returns (uint256) {\\n        return storedData;\\n    }\\n}"
  },
  {
    id: 'tpl-elixir-module',
    title: 'Elixir GenServer',
    description: 'Basic Elixir GenServer implementation state module',
    language: 'Elixir',
    tag: 'Elixir',
    content: "defmodule DevNest.Counter do\\n  use GenServer\\n\\n  # Client API\\n  def start_link(initial_count) do\\n    GenServer.start_link(__MODULE__, initial_count, name: __MODULE__)\\n  end\\n\\n  def increment do\\n    GenServer.cast(__MODULE__, :increment)\\n  end\\n\\n  def get_count do\\n    GenServer.call(__MODULE__, :get_count)\\n  end\\n\\n  # Server Callbacks\\n  @impl true\\n  def init(count) do\\n    {:ok, count}\\n  end\\n\\n  @impl true\\n  def handle_cast(:increment, state) do\\n    {:noreply, state + 1}\\n  end\\n\\n  @impl true\\n  def handle_call(:get_count, _from, state) do\\n    {:reply, state, state}\\n  end\\nend"
  },
  {
    id: 'tpl-groovy-script',
    title: 'Groovy Jenkins Pipeline',
    description: 'Jenkins declarative pipeline script in Groovy',
    language: 'Groovy',
    tag: 'Groovy',
    content: "pipeline {\\n    agent any\\n    \\n    stages {\\n        stage('Build') {\\n            steps {\\n                echo 'Building...'\\n                sh 'make build'\\n            }\\n        }\\n        stage('Test') {\\n            steps {\\n                echo 'Testing...'\\n                sh 'make test'\\n            }\\n        }\\n        stage('Deploy') {\\n            when {\\n                branch 'main'\\n            }\\n            steps {\\n                echo 'Deploying to Production...'\\n            }\\n        }\\n    }\\n}"
  },
  {
    id: 'tpl-lua-script',
    title: 'Lua Config Script',
    description: 'Basic Lua table and loop script',
    language: 'Lua',
    tag: 'Lua',
    content: "local config = {\\n  host = \"localhost\",\\n  port = 8080,\\n  max_connections = 100\\n}\\n\\nfunction printConfig(cfg)\\n  for key, value in pairs(cfg) do\\n    print(key .. \": \" .. tostring(value))\\n  end\\nend\\n\\nprint(\"Loading configuration...\")\\nprintConfig(config)"
  },
  {
    id: 'tpl-julia-func',
    title: 'Julia Math Function',
    description: 'Julia matrix operations and functions',
    language: 'Julia',
    tag: 'Julia',
    content: "module MathOps\\n\\nexport normalize_matrix\\n\\nfunction normalize_matrix(mat::Matrix{Float64})\\n    col_sums = sum(mat, dims=1)\\n    return mat ./ col_sums\\nend\\n\\n# Example usage\\nA = rand(3, 3)\\nprintln(\"Original:\\\\n\", A)\\nprintln(\"Normalized:\\\\n\", normalize_matrix(A))\\n\\nend"
  },
  {
    id: 'tpl-scala-object',
    title: 'Scala App Object',
    description: 'Scala main application object with pattern matching',
    language: 'Scala',
    tag: 'Scala',
    content: "object Main extends App {\\n  val data = List(1, 2, 3, 4, 5)\\n  \\n  val doubled = data.map(_ * 2)\\n  \\n  def analyze(n: Int): String = n match {\\n    case x if x % 2 == 0 => s\"\\$x is even\"\\n    case x => s\"\\$x is odd\"\\n  }\\n  \\n  doubled.foreach(n => println(analyze(n)))\\n}"
  },
  {
    id: 'tpl-haskell-func',
    title: 'Haskell Pure Functions',
    description: 'Haskell recursive function and type signature',
    language: 'Haskell',
    tag: 'Haskell',
    content: "module Main where\\n\\n-- Calculate factorial recursively\\nfactorial :: Integer -> Integer\\nfactorial 0 = 1\\nfactorial n = n * factorial (n - 1)\\n\\n-- Quicksort implementation\\nquicksort :: (Ord a) => [a] -> [a]\\nquicksort [] = []\\nquicksort (x:xs) = \\n    let smaller = quicksort [a | a <- xs, a <= x]\\n        larger  = quicksort [a | a <- xs, a > x]\\n    in  smaller ++ [x] ++ larger\\n\\nmain :: IO ()\\nmain = do\\n    putStrLn \"Factorial of 5:\"\\n    print (factorial 5)"
  },
  {
    id: 'tpl-perl-script',
    title: 'Perl Regex Parser',
    description: 'Perl scripting for reading files and regex matching',
    language: 'Perl',
    tag: 'Perl',
    content: "#!/usr/bin/perl\\nuse strict;\\nuse warnings;\\n\\nmy \\$filename = 'data.txt';\\nif (open(my \\$fh, '<:encoding(UTF-8)', \\$filename)) {\\n    while (my \\$row = <\\$fh>) {\\n        chomp \\$row;\\n        if (\\$row =~ /error/i) {\\n            print \"Found error: \\$row\\\\n\";\\n        }\\n    }\\n    close(\\$fh);\\n} else {\\n    warn \"Could not open file '\\$filename' \\$!\";\\n}"
  },
  {
    id: 'tpl-r-dataframe',
    title: 'R Data Processing',
    description: 'Data frame manipulation and plotting in R',
    language: 'R',
    tag: 'R',
    content: "# Load library\\nlibrary(ggplot2)\\n\\n# Create a sample data frame\\ndf <- data.frame(\\n  x = 1:10,\\n  y = rnorm(10)\\n)\\n\\n# Basic summary\\nsummary(df)\\n\\n# Plot the data\\nggplot(df, aes(x = x, y = y)) +\\n  geom_line(color=\"blue\") +\\n  geom_point(size=3) +\\n  theme_minimal() +\\n  labs(title=\"Random Data Plot\")"
  },
  {
    id: 'tpl-objc-class',
    title: 'Objective-C Class',
    description: 'Interface and Implementation setup in Objective-C',
    language: 'Objective-C',
    tag: 'Objective-C',
    content: "#import <Foundation/Foundation.h>\\n\\n@interface Developer : NSObject\\n@property (nonatomic, strong) NSString *name;\\n@property (nonatomic, assign) NSInteger experience;\\n\\n- (instancetype)initWithName:(NSString *)name experience:(NSInteger)exp;\\n- (void)printInfo;\\n@end\\n\\n@implementation Developer\\n- (instancetype)initWithName:(NSString *)name experience:(NSInteger)exp {\\n    self = [super init];\\n    if (self) {\\n        _name = name;\\n        _experience = exp;\\n    }\\n    return self;\\n}\\n\\n- (void)printInfo {\\n    NSLog(@\"Name: %@, Experience: %ld\", self.name, (long)self.experience);\\n}\\n@end"
  },
  {
    id: 'tpl-asm-x86',
    title: 'x86 Assembly Hello',
    description: 'Basic x86 Linux system call to print string',
    language: 'Assembly',
    tag: 'Assembly',
    content: "section .data\\n    msg db 'Hello, Assembly!', 0xa  ; string with newline\\n    len equ \\$ - msg                 ; string length\\n\\nsection .text\\n    global _start\\n\\n_start:\\n    mov eax, 4      ; sys_write\\n    mov ebx, 1      ; stdout\\n    mov ecx, msg    ; message address\\n    mov edx, len    ; message length\\n    int 0x80        ; call kernel\\n\\n    mov eax, 1      ; sys_exit\\n    mov ebx, 0      ; exit code 0\\n    int 0x80        ; call kernel"
  },
  {
    id: 'tpl-other-generic',
    title: 'Generic Config Template',
    description: 'A generic fallback configuration template',
    language: 'Other',
    tag: 'Other',
    content: "# DevNest Custom Configuration\\n# Version: 1.0\\n\\n[Settings]\\nenabled = true\\nmode = offline\\nmax_limit = 500\\n\\n[Sources]\\nprimary = local_db\\nsecondary = cache"
  }
];
