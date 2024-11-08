-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Nov 08, 2024 at 03:54 PM
-- Server version: 9.1.0
-- PHP Version: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `SAT`
--

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `SubjectID` int NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `Content` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin,
  `Image_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `Course-ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`SubjectID`, `Name`, `Content`, `Image_id`, `Course-ID`) VALUES
(1, 'Subject Test1', '1234567890qwertyuiopasdfghjkl;\'zxcvbnm,.   dgsaiyhcxbviagscygbiusdhaovijisdajfoisoaifhiewhgbdsvooisdafijdf', 'Icon', 1),
(2, 'Subject 2', 'ฟหัดักหเรีอปผี้ฆฺฏณ๊ฤฌโณ๊ฌ\"๊โฌฎ๊ณฏฆ็ฌฯณ็ฏฆโ+๑๒๓๔ู฿๕๖7523.', 'Icon', 1),
(3, 'Course 2 Subject 1', 'abcdef TESt 123456789423421245512123', 'Icon', 2),
(4, 'Course 2 Subject 2', 'abcdef TESt 123456789423421245512123', 'Icon', 2),
(5, 'Course 2 Subject 3', 'abcdef TESt 123456789423421245512123', 'Icon', 2),
(6, 'Phishing', '“ฟิชชิ่ง” หมายถึงความพยายามที่จะขโมยข้อมูลที่ละเอียดอ่อน โดยทั่วไปจะอยู่ในรูปแบบของชื่อผู้ใช้ รหัสผ่าน หมายเลขบัตรเครดิต ข้อมูลบัญชีธนาคาร หรือข้อมูลสำคัญอื่น ๆ เพื่อใช้หรือขายข้อมูลที่ถูกขโมย ด้วยการปลอมตัวเป็นแหล่งที่เชื่อถือได้พร้อมกับคำขอที่ล่อลวง ผู้โจมตีจึงล่อเหยื่อเพื่อหลอกเหยื่อ เช่นเดียวกับวิธีที่ชาวประมงใช้เหยื่อเพื่อจับปลา', 'Icon', 3),
(7, 'SPAM', 'เป็นหนึ่งในวิธีการที่ผู้ไม่หวังดีใช้เพื่อหลอกลวงและเข้าถึงข้อมูลส่วนบุคคลหรือทรัพยากรของเหยื่อ โดยการส่งข้อมูลจำนวนมากผ่านช่องทางต่างๆ เช่น อีเมล ข้อความโซเชียลมีเดีย หรือข้อความ SMS เพื่อดึงดูดให้เหยื่อตอบกลับหรือคลิกที่ลิงก์ที่แนบมาด้วย\r\n\r\nข้อมูลสำคัญเกี่ยวกับ Spam ใน Social Engineering\r\n\r\n1.ลักษณะของ Spam\r\n\r\n-ปริมาณการส่ง: ส่งข้อความจำนวนมากให้กับผู้ใช้ในเวลาเดียวกัน โดยไม่เจาะจงผู้รับ\r\n-เนื้อหาที่น่าสงสัย: มักประกอบด้วยข้อความที่กระตุ้นความสนใจหรือความเร่งด่วน เช่น \"คุณได้รับรางวัล!\" หรือ \"รีบคลิกก่อนหมดเวลา\"\r\n-แหล่งที่มาที่ไม่ชัดเจน: มาจากแหล่งที่ไม่น่าเชื่อถือ หรือบางครั้งอาจดูเหมือนมาจากหน่วยงานที่น่าเชื่อถือ แต่จริงๆ แล้วถูกปลอมแปลงขึ้นมา\r\n\r\n2.วิธีการใช้งาน Spam ใน Social Engineering\r\n\r\n-Phishing (ฟิชชิ่ง): ใช้เพื่อขโมยข้อมูลส่วนตัว เช่น รหัสผ่านหรือข้อมูลบัตรเครดิต โดยหลอกให้เหยื่อคลิกที่ลิงก์ที่นำไปสู่เว็บไซต์ปลอม\r\n-Malware Delivery: แนบไฟล์ที่มีมัลแวร์ในอีเมลหรือข้อความเพื่อให้เหยื่อดาวน์โหลดและติดตั้งโปรแกรมที่เป็นอันตรายโดยไม่รู้ตัว\r\n-Scams (การหลอกลวง): ส่งข้อความที่มีเนื้อหาหลอกลวง เช่น การลงทุนปลอม หรือข้อเสนอที่ดูน่าสนใจเกินจริง เพื่อให้เหยื่อโอนเงินหรือให้ข้อมูลส่วนตัว\r\n\r\n3.วิธีการป้องกันตัวจาก Spam\r\n\r\n-ระวังอีเมลและข้อความจากแหล่งที่ไม่น่าเชื่อถือ: หลีกเลี่ยงการคลิกที่ลิงก์หรือดาวน์โหลดไฟล์จากอีเมลหรือข้อความที่มาจากผู้ส่งที่ไม่รู้จัก\r\n-ใช้โปรแกรมกรอง Spam: ใช้โปรแกรมอีเมลที่มีระบบกรอง Spam หรือมีการตั้งค่าการรักษาความปลอดภัยเพื่อกรองเนื้อหาที่อาจเป็นอันตราย\r\n-ฝึกการรับรู้ถึง Spam: สังเกตลักษณะของข้อความที่อาจเป็น Spam เช่น ข้อความที่ใช้คำเร่งด่วน หรือขอให้ให้ข้อมูลสำคัญอย่างเร่งรีบ\r\n\r\n', 'icon', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`SubjectID`),
  ADD KEY `Couese-ID_idx` (`Course-ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `SubjectID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `Couese-ID` FOREIGN KEY (`Course-ID`) REFERENCES `courses` (`CourseID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
