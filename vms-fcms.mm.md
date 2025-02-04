---
title: VMS-FCMS
markmap:
  colorFreezeLevel: 5
---

## ข้อมูลธุรกรรมรายวัน
### ตารางข้อมูล ==(Mantine React Table)==
- [x] ข้อมูลหลัก `แก้ไขในตารางไม่ได้`
  1. วันที่ทำรายการ
  2. ทะเบียน
  3. หมายเลขบัตร
  4. ธนาคาร
  5. จำนวนลิตร
  6. ยอดสุทธิ
- ข้อมูลหลัก `กรอกในตาราง`
  1. สถานที่ขอรับเงิน (BP)
  2. รหัสบัญชีเจ้าหนี้ขาจร
  3. ศูนย์ต้นทุน
  4. บัญชี GL
  5. รหัสเจ้าหนี้ของธนาคาร
  6. ประเภทน้ำมัน
- ข้อมูลสนับสนุน*ภายใต้หลัก*
  1. item 1
  2. item 2
### Action
- บันทึกและส่งขึ้น SAP
- บันทึกข้อมูล
- ทำเครื่องหมายผิดปกติ

## บัตรเติมน้ำมัน
### ตารางข้อมูล ==(Mantine React Table)==
- ข้อมูลหลัก `แก้ไขในตารางได้`
  1. item 1
  2. item 2
- ข้อมูลสนับสนุน*ภายใต้หลัก*
  1. item 1
  2. item 2
### Action
- xxx
- xxx
- xxx

## Backend API Service
- Keycloak Connection (NextAuth)
- Export to Text File (Interface SAP F-43)
- Export to Text File (Interface SAP F-51)
- Send File to SAP FTP Server (CronJOB)

## Database ==POSTGRESQL==
- [x] SQL Database Schema Only
- [x] SQL Database Data with Schema

## OPS
- [x] Database-Dockerfile
- Fullstack-Dockerfile
- Docker-Compose