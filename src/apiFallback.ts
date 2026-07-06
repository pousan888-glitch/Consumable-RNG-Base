/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryDB, User, Cabinet, Department, ConsumableItem, InspectionLog, ConsumptionLog, UserRole } from './types.js';

const initialDB: InventoryDB = {
  users: [
    { id: '1', email: 'pousan888@gmail.com', name: 'Pousan Admin', role: 'admin' },
    { id: '2', email: 'helper1@gmail.com', name: 'John Helper', role: 'helper', departmentId: 'dept-wcf' },
    { id: '3', email: 'qc1@gmail.com', name: 'Sarah QC', role: 'qc', departmentId: 'dept-wcf' }
  ],
  departments: [
    { id: 'dept-wcf', name: 'WCF CMT' },
    { id: 'dept-rpe', name: 'RPE REW' },
    { id: 'dept-wcm', name: 'WCM DNM' }
  ],
  cabinets: [
    { id: 'cab-wcf-cmt-blue', name: 'WCF CMT (ตู้น้ำเงิน)', location: 'WCF CMT Site - ตู้น้ำเงิน' },
    { id: 'cab-wcf-cmt-orange', name: 'WCF CMT (ตู้ส้ม)', location: 'WCF CMT Site - ตู้ส้ม' },
    { id: 'cab-rpe-rew', name: 'RPE REW Cabinet', location: 'RPE REW Site' },
    { id: 'cab-wcm-dnm', name: 'WCM DNM Cabinet', location: 'WCM DNM Site' },
    { id: 'cab-yellow', name: 'ตู้เหลือง (Yellow Cabinet)', location: 'WCF CMT Site - ตู้เหลือง' }
  ],
  items: [
    // WCF CMT - ตู้น้ำเงิน (cab-wcf-cmt-blue)
    { id: 'item-cover-bag', name: 'COVER BAG (ถุงลูกเต๋า)', imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 8, minThreshold: 5, previousStock: 8, unit: 'PK' },
    { id: 'item-clear-bag', name: 'Clear Bag (ถุงใส)', imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 7, minThreshold: 5, previousStock: 7, unit: 'EA' },
    { id: 'item-plastic-wrap-blue', name: 'PLASTIC WRAP (พลาสติกแรป)', imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 12, minThreshold: 8, previousStock: 12, unit: 'EA' },
    { id: 'item-plastic-green-pet-blue', name: 'PLASTIC GREEN PET (แบนเขียว)', imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b76?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 6, minThreshold: 5, previousStock: 6, unit: 'EA' },
    { id: 'item-plastic-grip-blue', name: 'PLASTIC GRIP (ลูกแม็ก)', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 4, minThreshold: 2, previousStock: 4, unit: 'Box' },
    { id: 'item-cloth-tape-blue', name: 'CLOTH TAPE (เทปผ้า/กระดาษ)', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 15, minThreshold: 10, previousStock: 15, unit: 'EA' },
    { id: 'item-brown-tape-blue', name: 'BROWN PACKING TAPE (เทปน้ำตาล)', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 14, minThreshold: 10, previousStock: 14, unit: 'EA' },
    { id: 'item-electrical-tape-blue', name: 'ELECTRICAL TAPE (เทปพันสายไฟ)', imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 8, minThreshold: 5, previousStock: 8, unit: 'EA' },
    { id: 'item-manila-rope-blue', name: 'Manila Rope (เชือกแท็กไลน์)', imageUrl: 'https://images.unsplash.com/photo-1511216113906-8f57bb83e776?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 3, minThreshold: 2, previousStock: 3, unit: 'EA' },
    { id: 'item-paint-brush-1-blue', name: 'Paint Brush 1” (แปรงทาสี 1 นิ้ว)', imageUrl: 'https://images.unsplash.com/photo-1520189124422-c40606349e97?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 1, minThreshold: 1, previousStock: 1, unit: 'EA' },
    { id: 'item-paint-brush-2-blue', name: 'Paint Brush 2” (แปรงทาสี 2 นิ้ว)', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-blue', currentStock: 2, minThreshold: 1, previousStock: 2, unit: 'EA' },

    // WCF CMT - ตู้ส้ม (cab-wcf-cmt-orange)
    { id: 'item-sample-bottle-orange', name: 'Sample Bottle 1 L. (ขวดเก็บตัวอย่าง 1 ลิตร)', imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 35, minThreshold: 20, previousStock: 35, unit: 'EA' },
    { id: 'item-plastic-bucket-orange', name: 'Plastic Bucket 20 L. (ถังพลาสติก 20 ลิตร)', imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 12, minThreshold: 10, previousStock: 12, unit: 'EA' },
    { id: 'item-gallon-5l-orange', name: 'Gallon 5 L. w/ lid (ถังแกลลอน 5 ลิตร พร้อมฝา)', imageUrl: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 8, minThreshold: 5, previousStock: 8, unit: 'EA' },
    { id: 'item-gallon-20l-orange', name: 'Gallon 20 L. w/ lid (ถังแกลลอน 20 ลิตร พร้อมฝา)', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 7, minThreshold: 5, previousStock: 7, unit: 'EA' },
    { id: 'item-brilube-30-orange', name: 'BRILUBE 30 Aerosol 400 ml. (น้ำมันหล่อลื่น)', imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 2, minThreshold: 1, previousStock: 2, unit: 'EA' },
    { id: 'item-brilube-70-orange', name: 'BRILUBE 70 ADVANCE Wire Rope 5 kg.', imageUrl: 'https://images.unsplash.com/photo-1541535881962-e668f2c36a3d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 1, minThreshold: 1, previousStock: 1, unit: 'PAIL' },
    { id: 'item-duct-tape-avon-orange', name: 'DUCT TAPE, AVON, GRAY (เทปผ้ายี่ห้อ AVON สีเทา)', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 15, minThreshold: 10, previousStock: 15, unit: 'EA' },
    { id: 'item-split-cotter-m4-orange', name: 'Steel Split Cotter Pin (M4*40) (ปิ่นเหล็ก)', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 12, minThreshold: 10, previousStock: 12, unit: 'EA' },
    { id: 'item-split-cotter-m5-orange', name: 'Steel Split Cotter Pin (M5*50) (ปิ่นเหล็ก)', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 14, minThreshold: 10, previousStock: 14, unit: 'EA' },
    { id: 'item-wooden-pallet-orange', name: 'Wooden pallet (พาเลทไม้)', imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 11, minThreshold: 10, previousStock: 11, unit: 'EA' },
    { id: 'item-color-ral-2008-1l-orange', name: 'COLOR RAL 2008 Orange (1 liter) (สีส้ม)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 8, minThreshold: 6, previousStock: 8, unit: 'CAN' },
    { id: 'item-color-ral-2008-4l-orange', name: 'COLORRAL 2008 Orange (4 liter) (สีส้ม)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-wcf-cmt-orange', currentStock: 3, minThreshold: 2, previousStock: 3, unit: 'PAIL' },

    // RPE REW (cab-rpe-rew)
    { id: 'item-plastic-wrap-rpe', name: 'PLASTIC WRAP (พลาสติกแรป)', imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-rpe', cabinetId: 'cab-rpe-rew', currentStock: 10, minThreshold: 8, previousStock: 10, unit: 'EA' },
    { id: 'item-plastic-green-pet-rpe', name: 'PLASTIC PET PACKING, GREEN (แบนเขียว)', imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b76?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-rpe', cabinetId: 'cab-rpe-rew', currentStock: 7, minThreshold: 5, previousStock: 7, unit: 'ROLL' },
    { id: 'item-plastic-grip-rpe', name: 'GRIP PLASTIC (ลูกแม็ก)', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-rpe', cabinetId: 'cab-rpe-rew', currentStock: 3, minThreshold: 2, previousStock: 3, unit: 'BX' },
    { id: 'item-manila-rope-rpe', name: 'ROPE, MANILA (เชือกแท็กไลน์)', imageUrl: 'https://images.unsplash.com/photo-1511216113906-8f57bb83e776?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-rpe', cabinetId: 'cab-rpe-rew', currentStock: 4, minThreshold: 2, previousStock: 4, unit: 'EA' },
    { id: 'item-duct-tape-rpe', name: 'DUCT TAPE (เทปผ้า)', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-rpe', cabinetId: 'cab-rpe-rew', currentStock: 12, minThreshold: 10, previousStock: 12, unit: 'EA' },
    { id: 'item-silicone-rpe', name: 'SILICONE SEALANT SISTA S16 (ซิลิโคน)', imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-rpe', cabinetId: 'cab-rpe-rew', currentStock: 6, minThreshold: 5, previousStock: 6, unit: 'EA' },
    { id: 'item-color-ral-2008-4l-rpe', name: 'COLOR RAL 2008 Orange (4 liter) (สีส้ม)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-rpe', cabinetId: 'cab-rpe-rew', currentStock: 2, minThreshold: 2, previousStock: 2, unit: 'PAIL' },
    { id: 'item-sticker-rpe', name: 'A4 STICKER (สติกเกอร์ขนาด A4)', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-rpe', cabinetId: 'cab-rpe-rew', currentStock: 8, minThreshold: 5, previousStock: 8, unit: 'PK' },

    // WCM DNM (cab-wcm-dnm)
    { id: 'item-plastic-wrap-wcm', name: 'PLASTIC WRAP (พลาสติกแรป)', imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcm', cabinetId: 'cab-wcm-dnm', currentStock: 11, minThreshold: 8, previousStock: 11, unit: 'EA' },
    { id: 'item-plastic-green-pet-wcm', name: 'PLASTIC PET PACKING, GREEN (แบนเขียว)', imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b76?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcm', cabinetId: 'cab-wcm-dnm', currentStock: 6, minThreshold: 5, previousStock: 6, unit: 'ROLL' },
    { id: 'item-plastic-grip-wcm', name: 'GRIP PLASTIC (ลูกแม็ก)', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcm', cabinetId: 'cab-wcm-dnm', currentStock: 4, minThreshold: 2, previousStock: 4, unit: 'BX' },
    { id: 'item-manila-rope-wcm', name: 'ROPE, MANILA (เชือกแท็กไลน์)', imageUrl: 'https://images.unsplash.com/photo-1511216113906-8f57bb83e776?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcm', cabinetId: 'cab-wcm-dnm', currentStock: 3, minThreshold: 2, previousStock: 3, unit: 'EA' },
    { id: 'item-duct-tape-wcm', name: 'DUCT TAPE (เทปผ้า)', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcm', cabinetId: 'cab-wcm-dnm', currentStock: 16, minThreshold: 10, previousStock: 16, unit: 'EA' },
    { id: 'item-silicone-wcm', name: 'SILICONE SEALANT SISTA S16 (ซิลิโคน)', imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcm', cabinetId: 'cab-wcm-dnm', currentStock: 7, minThreshold: 5, previousStock: 7, unit: 'EA' },
    { id: 'item-color-ral-2008-4l-wcm', name: 'COLORRAL 2008 Orange (4 liter) (สีส้ม)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcm', cabinetId: 'cab-wcm-dnm', currentStock: 3, minThreshold: 2, previousStock: 3, unit: 'PAIL' },
    { id: 'item-sticker-wcm', name: 'A4 STICKER (สติกเกอร์ขนาด A4)', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcm', cabinetId: 'cab-wcm-dnm', currentStock: 5, minThreshold: 5, previousStock: 5, unit: 'PK' },

    // ตู้เหลือง (cab-yellow)
    { id: 'item-spray-fm-orange', name: 'FM AUTO SPRAY RAL 2008 (ORANGE) (สีสเปรย์ส้ม)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 7, minThreshold: 5, previousStock: 7, unit: 'EA' },
    { id: 'item-spray-kobe-green', name: 'KOBE SPRAY F5 (GREEN) (สีสเปรย์เขียว)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 4, minThreshold: 2, previousStock: 4, unit: 'EA' },
    { id: 'item-spray-kobe-blue', name: 'KOBE SPRAY 916 (DARK BLUE) (สีสเปรย์น้ำเงิน)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 10, minThreshold: 5, previousStock: 10, unit: 'EA' },
    { id: 'item-spray-kobe-yellow', name: 'KOBE SPRAY 918 (YELLOW) (สีสเปรย์เหลือง)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 18, minThreshold: 10, previousStock: 18, unit: 'EA' },
    { id: 'item-spray-kobe-white', name: 'KOBE SPRAY 900 (WHITE) (สีสเปรย์ขาว)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 62, minThreshold: 50, previousStock: 62, unit: 'EA' },
    { id: 'item-spray-atm-f4', name: 'ATM FLUORESCENT F4 (สีสเปรย์ ATM)', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 8, minThreshold: 5, previousStock: 8, unit: 'EA' },
    { id: 'item-paint-fm-orange', name: 'FM PRIME RAL 2008 (ORANGE) (สีไพรม์ส้ม)', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 2, minThreshold: 2, previousStock: 2, unit: 'EA' },
    { id: 'item-paint-toa-orange', name: 'TOA GLIPTON RAL 2008 (ORANGE) (สีกลิปตันส้ม)', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 1, minThreshold: 1, previousStock: 1, unit: 'EA' },
    { id: 'item-paint-lobster-blue', name: 'LOBSTER 977 (RIVER BLUE) (สีน้ำเงินริเวอร์บลู)', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 2, minThreshold: 2, previousStock: 2, unit: 'EA' },
    { id: 'item-paint-toa-road-yellow', name: 'TOA ROAD LINE PAINT 703 (สีตีเส้นเหลือง)', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 2, minThreshold: 2, previousStock: 2, unit: 'EA' },
    { id: 'item-paint-toa-roof-green', name: 'TOA ROOF PAINT R390 (GREEN) (สีทาหลังคา)', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 3, minThreshold: 2, previousStock: 3, unit: 'EA' },
    { id: 'item-paint-toa-roof-grey', name: 'TOA ROOF PAINT R800 (DARK GREY) (สีทาหลังคา)', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 2, minThreshold: 2, previousStock: 2, unit: 'EA' },
    { id: 'item-paint-toa-grey-primer', name: 'TOA GREY PRIMER (GREY) (สีเกรย์ไพร์เมอร์)', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 1, minThreshold: 1, previousStock: 1, unit: 'EA' },
    { id: 'item-paint-jotun-pink', name: 'JOTUN RAL 4003 (PINK) (สีโจตันชมพู)', imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 1, minThreshold: 1, previousStock: 1, unit: 'EA' },
    { id: 'item-paint-jotun-hardener', name: 'JOTUN PENGUARD HARDENER (CLEAR) (ฮาร์ดเดนเนอร์)', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 18, minThreshold: 15, previousStock: 18, unit: 'EA' },
    { id: 'item-paint-sogo-thinner', name: 'SOGO THINNER (โซโก้ ทินเนอร์)', imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 1, minThreshold: 1, previousStock: 1, unit: 'EA' },
    { id: 'item-paint-brilube-70-wire', name: 'BRILUBE 70 (WIRE ROPE LUBRICANT) (บรีลูบ)', imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-wcf', cabinetId: 'cab-yellow', currentStock: 2, minThreshold: 1, previousStock: 2, unit: 'EA' }
  ],
  inspectionLogs: [
    {
      id: 'log-1',
      cabinetId: 'cab-wcf-cmt-blue',
      userId: '2',
      userName: 'John Helper',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      itemsCounted: [
        { itemId: 'item-cover-bag', countedQuantity: 8, previousQuantity: 8 }
      ]
    }
  ],
  consumptionLogs: [
    {
      id: 'cons-1',
      itemId: 'item-cover-bag',
      itemName: 'COVER BAG (ถุงลูกเต๋า)',
      cabinetId: 'cab-wcf-cmt-blue',
      cabinetName: 'WCF CMT (ตู้น้ำเงิน)',
      userId: '3',
      userName: 'Sarah QC',
      departmentId: 'dept-wcf',
      departmentName: 'WCF CMT',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      quantityConsumed: 2,
      purpose: 'Regular production packaging count audit'
    }
  ]
};

const LOCAL_STORAGE_KEY = 'local_consumables_db';

function readDB(): InventoryDB {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialDB));
    return JSON.parse(JSON.stringify(initialDB));
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialDB));
    return JSON.parse(JSON.stringify(initialDB));
  }
}

function writeDB(db: InventoryDB) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
}

function getAuthenticatedUser(email: string | null): User | null {
  if (!email) return null;
  const db = readDB();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (email.toLowerCase() === 'pousan888@gmail.com') {
    if (!user) {
      user = { id: '1', email: 'pousan888@gmail.com', name: 'Pousan Admin', role: 'admin' };
      db.users.push(user);
      writeDB(db);
    } else if (user.role !== 'admin') {
      user.role = 'admin';
      writeDB(db);
    }
  } else if (!user) {
    user = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      name: email.split('@')[0],
      role: 'helper'
    };
    db.users.push(user);
    writeDB(db);
  }

  return user || null;
}

export async function handleMockFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const headers = init?.headers as Record<string, string> || {};
  const userEmailHeader = headers['X-User-Email'] || headers['x-user-email'] || null;

  let body: any = null;
  if (init?.body) {
    try {
      body = JSON.parse(init.body as string);
    } catch (e) {}
  }

  // Helper to construct a Response object
  const makeResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  // --- API ROUTER MOCK ---

  // 1. GET /api/state
  if (url === '/api/state' && method === 'GET') {
    return makeResponse(readDB());
  }

  // 2. POST /api/reset
  if (url === '/api/reset' && method === 'POST') {
    writeDB(initialDB);
    return makeResponse({ message: 'Database reset successfully', db: initialDB });
  }

  // 3. POST /api/auth/login
  if (url === '/api/auth/login' && method === 'POST') {
    const { email, name, role } = body || {};
    if (!email) {
      return makeResponse({ error: 'Email is required' }, 400);
    }

    const db = readDB();
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const isSuperAdmin = email.toLowerCase() === 'pousan888@gmail.com';
      user = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        role: isSuperAdmin ? 'admin' : (role || 'helper')
      };
      db.users.push(user);
      writeDB(db);
    }

    return makeResponse(user);
  }

  // 4. GET /api/auth/me
  if (url === '/api/auth/me' && method === 'GET') {
    const user = getAuthenticatedUser(userEmailHeader);
    if (!user) {
      return makeResponse({ error: 'Not authenticated' }, 401);
    }
    return makeResponse(user);
  }

  // 4.5. POST /api/users/language
  if (url === '/api/users/language' && method === 'POST') {
    const user = getAuthenticatedUser(userEmailHeader);
    if (!user) {
      return makeResponse({ error: 'Not authenticated' }, 401);
    }
    const { language } = body || {};
    if (language !== 'th' && language !== 'en') {
      return makeResponse({ error: 'Invalid language' }, 400);
    }
    const db = readDB();
    const dbUser = db.users.find(u => u.id === user.id);
    if (dbUser) {
      dbUser.language = language;
      writeDB(db);
      return makeResponse({ success: true, language: dbUser.language });
    }
    return makeResponse({ error: 'User not found' }, 404);
  }

  // 5. GET /api/users
  if (url === '/api/users' && method === 'GET') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }
    return makeResponse(readDB().users);
  }

  // 6. POST /api/users
  if (url === '/api/users' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const { email, name, role, departmentId } = body || {};
    if (!email || !role) {
      return makeResponse({ error: 'Email and role are required' }, 400);
    }

    const db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return makeResponse({ error: 'User already exists' }, 400);
    }

    const newUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role,
      departmentId
    };

    db.users.push(newUser);
    writeDB(db);
    return makeResponse(newUser, 201);
  }

  // 7. PUT /api/users/:id
  if (url.startsWith('/api/users/') && method === 'PUT') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];
    const { name, role, departmentId } = body || {};

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return makeResponse({ error: 'User not found' }, 404);
    }

    const updatedUser = {
      ...db.users[userIndex],
      name: name !== undefined ? name : db.users[userIndex].name,
      role: role !== undefined ? role : db.users[userIndex].role,
      departmentId: departmentId !== undefined ? departmentId : db.users[userIndex].departmentId
    };

    db.users[userIndex] = updatedUser;
    writeDB(db);
    return makeResponse(updatedUser);
  }

  // 8. DELETE /api/users/:id
  if (url.startsWith('/api/users/') && method === 'DELETE') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    db.users = db.users.filter(u => u.id !== id);
    writeDB(db);
    return makeResponse({ message: 'User deleted' });
  }

  // 9. POST /api/items
  if (url === '/api/items' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const db = readDB();
    const newItem: ConsumableItem = {
      id: 'item_' + Math.random().toString(36).substr(2, 9),
      name: body.name,
      imageUrl: body.imageUrl,
      departmentId: body.departmentId,
      cabinetId: body.cabinetId,
      currentStock: Number(body.currentStock),
      minThreshold: Number(body.minThreshold),
      previousStock: Number(body.currentStock),
      unit: body.unit
    };

    db.items.push(newItem);
    writeDB(db);
    return makeResponse(newItem, 201);
  }

  // 10. PUT /api/items/:id
  if (url.startsWith('/api/items/') && method === 'PUT') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    const index = db.items.findIndex(i => i.id === id);
    if (index === -1) return makeResponse({ error: 'Item not found' }, 404);

    const updated = {
      ...db.items[index],
      name: body.name,
      imageUrl: body.imageUrl,
      departmentId: body.departmentId,
      cabinetId: body.cabinetId,
      currentStock: Number(body.currentStock),
      minThreshold: Number(body.minThreshold),
      previousStock: body.previousStock !== undefined ? Number(body.previousStock) : db.items[index].previousStock,
      unit: body.unit
    };

    db.items[index] = updated;
    writeDB(db);
    return makeResponse(updated);
  }

  // 11. DELETE /api/items/:id
  if (url.startsWith('/api/items/') && method === 'DELETE') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    db.items = db.items.filter(i => i.id !== id);
    writeDB(db);
    return makeResponse({ message: 'Deleted' });
  }

  // 12. POST /api/cabinets
  if (url === '/api/cabinets' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const db = readDB();
    const newCabinet: Cabinet = {
      id: 'cab_' + Math.random().toString(36).substr(2, 9),
      name: body.name,
      location: body.location
    };

    db.cabinets.push(newCabinet);
    writeDB(db);
    return makeResponse(newCabinet, 201);
  }

  // 13. PUT /api/cabinets/:id
  if (url.startsWith('/api/cabinets/') && method === 'PUT') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    const index = db.cabinets.findIndex(c => c.id === id);
    if (index === -1) return makeResponse({ error: 'Cabinet not found' }, 404);

    const updated = {
      ...db.cabinets[index],
      name: body.name,
      location: body.location
    };

    db.cabinets[index] = updated;
    writeDB(db);
    return makeResponse(updated);
  }

  // 14. DELETE /api/cabinets/:id
  if (url.startsWith('/api/cabinets/') && method === 'DELETE') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    db.cabinets = db.cabinets.filter(c => c.id !== id);
    db.items = db.items.filter(i => i.cabinetId !== id);
    writeDB(db);
    return makeResponse({ message: 'Deleted' });
  }

  // 15. POST /api/departments
  if (url === '/api/departments' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const db = readDB();
    const newDept: Department = {
      id: 'dept_' + Math.random().toString(36).substr(2, 9),
      name: body.name
    };

    db.departments.push(newDept);
    writeDB(db);
    return makeResponse(newDept, 201);
  }

  // 16. PUT /api/departments/:id
  if (url.startsWith('/api/departments/') && method === 'PUT') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    const index = db.departments.findIndex(d => d.id === id);
    if (index === -1) return makeResponse({ error: 'Department not found' }, 404);

    const updated = {
      ...db.departments[index],
      name: body.name
    };

    db.departments[index] = updated;
    writeDB(db);
    return makeResponse(updated);
  }

  // 17. DELETE /api/departments/:id
  if (url.startsWith('/api/departments/') && method === 'DELETE') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    db.departments = db.departments.filter(d => d.id !== id);
    writeDB(db);
    return makeResponse({ message: 'Deleted' });
  }

  // 18. POST /api/logs/inspection
  if (url === '/api/logs/inspection' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser) {
      return makeResponse({ error: 'Authentication required' }, 401);
    }

    const { cabinetId, counts } = body || {};
    if (!cabinetId || !counts) {
      return makeResponse({ error: 'CabinetId and counts are required' }, 400);
    }

    const db = readDB();
    const cabinet = db.cabinets.find(c => c.id === cabinetId);
    if (!cabinet) {
      return makeResponse({ error: 'Cabinet not found' }, 404);
    }

    const itemsCounted: any[] = [];
    Object.entries(counts).forEach(([itemId, qty]) => {
      const item = db.items.find(i => i.id === itemId);
      if (item) {
        itemsCounted.push({
          itemId,
          countedQuantity: Number(qty),
          previousQuantity: item.currentStock
        });
        item.previousStock = item.currentStock;
        item.currentStock = Number(qty);
      }
    });

    const newLog: InspectionLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      cabinetId,
      userId: authUser.id,
      userName: authUser.name,
      timestamp: new Date().toISOString(),
      itemsCounted
    };

    db.inspectionLogs.push(newLog);
    writeDB(db);
    return makeResponse({ message: 'Success', log: newLog, items: db.items }, 201);
  }

  // 19. POST /api/logs/consumption
  if (url === '/api/logs/consumption' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser) {
      return makeResponse({ error: 'Authentication required' }, 401);
    }

    const { itemId, quantityConsumed, purpose } = body || {};
    if (!itemId || !quantityConsumed || Number(quantityConsumed) <= 0 || !purpose) {
      return makeResponse({ error: 'Required fields missing' }, 400);
    }

    const db = readDB();
    const item = db.items.find(i => i.id === itemId);
    if (!item) {
      return makeResponse({ error: 'Item not found' }, 404);
    }

    const consumedQty = Number(quantityConsumed);
    if (item.currentStock < consumedQty) {
      return makeResponse({ error: 'Insufficient stock' }, 400);
    }

    item.currentStock -= consumedQty;

    const cabinet = db.cabinets.find(c => c.id === item.cabinetId);
    const dept = db.departments.find(d => d.id === item.departmentId);

    const newLog: ConsumptionLog = {
      id: 'cons_' + Math.random().toString(36).substr(2, 9),
      itemId,
      itemName: item.name,
      cabinetId: item.cabinetId,
      cabinetName: cabinet ? cabinet.name : 'Unknown Cabinet',
      userId: authUser.id,
      userName: authUser.name,
      departmentId: item.departmentId,
      departmentName: dept ? dept.name : 'Unknown Department',
      timestamp: new Date().toISOString(),
      quantityConsumed: consumedQty,
      purpose
    };

    db.consumptionLogs.push(newLog);
    writeDB(db);
    return makeResponse({ message: 'Success', log: newLog, item }, 201);
  }

  return makeResponse({ error: 'Mock endpoint not found' }, 404);
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  
  if (url.startsWith('/api/')) {
    const isOnVercel = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
    const forceFallback = localStorage.getItem('force_fallback') === 'true';
    
    if (isOnVercel || forceFallback) {
      return handleMockFetch(url, init);
    }
    
    try {
      const res = await fetch(input, init);
      if (res.status === 404) {
        console.warn(`[API 404] Endpoint not found: ${url}. Activating client-side fallback.`);
        localStorage.setItem('force_fallback', 'true');
        return handleMockFetch(url, init);
      }
      return res;
    } catch (err) {
      console.warn(`[API Error] Request failed to: ${url}. Activating client-side fallback.`, err);
      localStorage.setItem('force_fallback', 'true');
      return handleMockFetch(url, init);
    }
  }
  
  return fetch(input, init);
}

