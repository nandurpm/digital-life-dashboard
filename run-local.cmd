@echo off
REM ============================================================
REM FILE: run-local.cmd
REM PURPOSE: Provides the Windows command launcher that forwards local commands to Digital Life Dashboard's Node.js entry point.
REM ============================================================

node scripts\run-local.mjs dev %*
