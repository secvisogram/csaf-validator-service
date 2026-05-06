#!/bin/sh

cd backend && npm ci --omit=dev
cd ..

mkdir -p dist

cp -r backend dist/
