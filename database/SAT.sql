-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Mar 10, 2025 at 09:03 AM
-- Server version: 9.2.0
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
-- Table structure for table `answer`
--

CREATE TABLE `answer` (
  `id` int NOT NULL,
  `content` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `type` int NOT NULL DEFAULT '0',
  `questionId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `answer`
--

INSERT INTO `answer` (`id`, `content`, `type`, `questionId`) VALUES
(1, 'การใช้มัลแวร์เข้ารหัสข้อมูลทั้งหมด', 0, 1),
(2, 'การโจมตีแบบ DDoS เพื่อทำให้ระบบล่ม', 0, 1),
(3, 'การหลอกให้เหยื่อเปิดเผยข้อมูลผ่านการสื่อสารทางจิตวิทยา', 1, 1),
(4, 'การใช้ซอฟต์แวร์ป้องกันไวรัสเพื่อดักจับข้อมูล', 0, 1),
(5, 'รายการเพลงโปรดของเหยื่อ', 0, 2),
(6, 'ข้อมูลบัญชีธนาคาร รหัสผ่าน และข้อมูลบัตรเครดิต', 1, 2),
(7, 'คะแนนสอบของนักเรียนในโรงเรียน', 0, 2),
(8, 'ประวัติการดูวิดีโอออนไลน์', 0, 2),
(9, 'เพราะใช้เทคนิคที่ต้องอาศัยความเชี่ยวชาญด้านเทคนิคขั้นสูง', 0, 3),
(10, 'เพราะเหยื่อมักไม่สงสัยและให้ข้อมูลโดยสมัครใจ', 1, 3),
(11, 'เพราะเป็นวิธีที่ผิดกฎหมายและมีบทลงโทษรุนแรง', 0, 3),
(12, 'เพราะต้องใช้ฮาร์ดแวร์เฉพาะในการโจมตี', 0, 3),
(13, 'ใช้รหัสผ่านที่ง่ายต่อการจำ เช่น \"123456\"', 0, 4),
(14, 'ตรวจสอบความถูกต้องของผู้ร้องขอข้อมูลก่อนเปิดเผย', 1, 4),
(15, 'ให้ข้อมูลกับทุกคนที่อ้างว่าเป็นเจ้าหน้าที่ขององค์กร', 0, 4),
(16, 'บันทึกข้อมูลสำคัญลงในโน้ตดิจิทัลโดยไม่มีการป้องกัน', 0, 4),
(17, 'ส่งลิงก์อัปเดตซอฟต์แวร์จริงให้เหยื่อ', 0, 5),
(18, 'แอบติดตั้งซอฟต์แวร์ป้องกันไวรัสให้เหยื่อ', 0, 5),
(19, 'สร้างสถานการณ์ที่ทำให้เหยื่อตื่นตระหนกหรือต้องรีบตัดสินใจ', 1, 5),
(20, 'แจ้งเตือนให้เหยื่อเปลี่ยนรหัสผ่านอย่างปลอดภัย', 0, 5),
(21, 'การโจมตีโดยใช้ซอฟต์แวร์อันตราย', 0, 6),
(22, 'การส่งอีเมลหรือข้อความหลอกลวงเพื่อขโมยข้อมูล', 1, 6),
(23, 'การโจมตีเครือข่ายด้วย DDoS', 0, 6),
(24, 'การใช้ไวรัสคอมพิวเตอร์', 0, 6),
(25, 'หลีกเลี่ยงการใช้รหัสผ่าน', 0, 7),
(26, 'เปิดไฟล์แนบทุกไฟล์เพื่อดูว่าเป็นอันตรายหรือไม่', 0, 7),
(27, 'ไม่คลิกลิงก์แปลกๆ และตรวจสอบแหล่งที่มา', 1, 7),
(28, 'ใช้คอมพิวเตอร์สาธารณะในการทำธุรกรรมออนไลน์', 0, 7),
(29, 'อีเมลแจ้งเตือนจากธนาคารให้ยืนยันข้อมูลโดยคลิกลิงก์', 1, 8),
(30, 'อีเมลโปรโมชั่นจากเว็บไซต์ที่สมัครสมาชิกไว้', 0, 8),
(31, 'อีเมลข่าวสารจากหน่วยงานราชการที่เกี่ยวข้อง', 0, 8),
(32, 'อีเมลจากเพื่อนที่ส่งไฟล์แนบ', 0, 8),
(33, 'ใช้ภาษาที่เป็นทางการและถูกต้องเสมอ', 0, 9),
(34, 'มีลิงก์ไปยังเว็บไซต์ที่ดูเหมือนจริง', 1, 9),
(35, 'ส่งจากอีเมลที่ได้รับการตรวจสอบจากบริษัท', 0, 9),
(36, 'ไม่มีข้อผิดพลาดด้านไวยากรณ์', 0, 9),
(37, 'เพื่อเรียนรู้เกี่ยวกับเทคโนโลยีใหม่ๆ', 0, 10),
(38, 'เพื่อขโมยข้อมูลส่วนตัวหรือข้อมูลทางการเงิน', 1, 10),
(39, 'เพื่อทดสอบระบบรักษาความปลอดภัยของบริษัท', 0, 10),
(40, 'เพื่อช่วยเหลือผู้ใช้งานให้รู้จักภัยคุกคาม', 0, 10),
(41, 'อีเมลแจ้งเตือนจากธนาคาร', 0, 11),
(42, 'อีเมลโฆษณาที่ไม่ได้สมัครรับ', 1, 11),
(43, 'อีเมลยืนยันการสั่งซื้อสินค้า', 0, 11),
(44, 'อีเมลจากเพื่อนที่ส่งไฟล์แนบ', 0, 11),
(45, 'เฉพาะทางอีเมล', 0, 12),
(46, 'ทางอีเมล ข้อความ และโซเชียลมีเดีย', 1, 12),
(47, 'เฉพาะในโซเชียลมีเดีย', 0, 12),
(48, 'เฉพาะบนเว็บไซต์ขององค์กร', 0, 12),
(49, 'ตอบกลับอีเมล SPAM เพื่อขอยกเลิกการรับ', 0, 13),
(50, 'ใช้ฟังก์ชันกรองอีเมลขยะ', 1, 13),
(51, 'คลิกลิงก์ที่แนบมากับ SPAM เพื่อตรวจสอบ', 0, 13),
(52, 'แชร์ที่อยู่อีเมลของคุณบนทุกเว็บไซต์', 0, 13),
(53, 'ก่อให้เกิดความรำคาญและเปลืองพื้นที่จัดเก็บ', 1, 14),
(54, 'เพิ่มความเร็วของอินเทอร์เน็ต', 0, 14),
(55, 'ทำให้บัญชีออนไลน์ของผู้ใช้ปลอดภัยขึ้น', 0, 14),
(56, 'ป้องกันมัลแวร์ได้', 0, 14),
(57, 'ทำให้ผู้ใช้งานได้รับข้อเสนอพิเศษจากบริษัทต่างๆ', 0, 15),
(58, 'มักเป็นช่องทางในการแพร่มัลแวร์และหลอกลวง', 1, 15),
(59, 'ช่วยให้บริษัทสามารถโฆษณาสินค้าได้มากขึ้น', 0, 15),
(60, 'เป็นแหล่งข้อมูลที่เป็นประโยชน์แก่ผู้ใช้', 0, 15),
(61, 'ใช้ไวรัสคอมพิวเตอร์เพื่อขโมยข้อมูล', 0, 16),
(62, 'หลอกให้เหยื่อติดตั้งซอฟต์แวร์หรือเปิดไฟล์อันตราย', 1, 16),
(63, 'แฮ็กเข้าสู่ระบบโดยใช้รหัสผ่านที่ขโมยมา', 0, 16),
(64, 'โจมตีเครือข่ายโดยใช้มัลแวร์', 0, 16),
(65, 'อีเมลแจ้งเตือนจากธนาคาร', 0, 17),
(66, 'การแจ้งเตือนซอฟต์แวร์อัปเดตจากบริษัทจริง', 0, 17),
(67, 'การแจ้งเตือนจากเว็บไซต์ข่าว', 0, 17),
(68, 'แฟลชไดร์ฟที่ถูกทิ้งไว้โดยเจตนาในที่สาธารณะ', 1, 17),
(69, 'เพื่อแจ้งเตือนผู้ใช้เกี่ยวกับการอัปเดตที่สำคัญ', 0, 18),
(70, 'เพื่อช่วยเหลือผู้ใช้งานให้รู้จักภัยคุกคาม', 0, 18),
(71, 'เพื่อเพิ่มความปลอดภัยในระบบ', 0, 18),
(72, 'เพื่อให้ผู้ใช้ติดตั้งมัลแวร์', 1, 18),
(73, 'ไม่เสียบอุปกรณ์ USB ที่ไม่รู้ที่มา', 1, 19),
(74, 'คลิกลิงก์ที่อ้างว่าเป็นของรางวัลฟรี', 0, 19),
(75, 'ดาวน์โหลดซอฟต์แวร์จากแหล่งที่ไม่รู้จัก', 0, 19),
(76, 'หยิบแฟลชไดร์ฟที่พบและเปิดดูข้อมูล', 0, 19),
(77, 'การโทรหลอกลวงว่าเป็นเจ้าหน้าที่ธนาคารเพื่อขอข้อมูล', 1, 20),
(78, 'การส่งอีเมลฟิชชิ่งเพื่อขอรหัสผ่าน', 0, 20),
(79, 'การใช้ไวรัสเพื่อโจมตีเครือข่าย', 0, 20),
(80, 'การแจ้งเตือนปลอมเกี่ยวกับไวรัสคอมพิวเตอร์', 0, 20),
(81, 'เพื่อสร้างความตื่นตระหนกให้เหยื่อ', 0, 21),
(82, 'เพื่อขโมยข้อมูลที่สำคัญโดยใช้เรื่องราวที่น่าเชื่อถือ', 1, 21),
(83, 'เพื่อทำให้เครือข่ายองค์กรล่ม', 0, 21),
(84, 'เพื่อให้เหยื่อดาวน์โหลดซอฟต์แวร์ปลอม', 0, 21),
(85, 'ตรวจสอบความถูกต้องของข้อมูลก่อนให้ข้อมูล', 1, 22),
(86, 'ให้ข้อมูลแก่ผู้ที่โทรมาขอทันที', 0, 22),
(87, 'ตอบกลับทุกอีเมลที่ขอข้อมูลส่วนตัว', 0, 22),
(88, 'เชื่อถือทุกสายโทรศัพท์ที่อ้างว่าเป็นเจ้าหน้าที่', 0, 22),
(89, 'ผู้โทรพยายามเร่งให้ตอบกลับทันที', 1, 23),
(90, 'ผู้โทรให้ข้อมูลรายละเอียดที่ถูกต้องเสมอ', 0, 23),
(91, 'อีเมลแจ้งเตือนจากหน่วยงานที่เกี่ยวข้อง', 0, 23),
(92, 'ผู้โทรไม่เคยขอข้อมูลใด ๆ จากเหยื่อ', 0, 23),
(93, 'การปลอมตัวเป็นบุคคลที่เชื่อถือได้เพื่อหลอกเอาข้อมูล', 1, 24),
(94, 'การโจมตีที่ใช้ซอฟต์แวร์เพื่อขโมยรหัสผ่าน', 0, 24),
(95, 'การเข้ารหัสไฟล์ของเหยื่อและเรียกค่าไถ่', 0, 24),
(96, 'การส่งอีเมลขยะไปยังผู้ใช้งาน', 0, 24),
(97, 'แฮ็กเข้าสู่บัญชีของเป้าหมายโดยตรง', 0, 25),
(98, 'โทรศัพท์หรือส่งอีเมลโดยอ้างว่าเป็นบุคคลสำคัญ', 1, 25),
(99, 'ใช้มัลแวร์เพื่อขโมยข้อมูล', 0, 25),
(100, 'ส่งโฆษณาหลอกลวง', 0, 25),
(101, 'การแฮ็กบัญชีผู้ใช้โดยตรง', 0, 26),
(102, 'การโจมตีเซิร์ฟเวอร์ขององค์กร', 0, 26),
(103, 'การโจมตีเครือข่ายโดยใช้มัลแวร์', 0, 26),
(104, 'การหลอกลวงโดยแอบอ้างว่าเป็นฝ่ายสนับสนุนทางเทคนิค', 1, 26),
(105, 'ขายซอฟต์แวร์ราคาถูกให้เหยื่อ', 0, 27),
(106, 'ปล่อยมัลแวร์เพื่อเข้าถึงข้อมูล', 0, 27),
(107, 'โทรศัพท์หาเหยื่อและอ้างว่าอุปกรณ์มีปัญหา', 1, 27),
(108, 'ส่งอีเมลแจ้งเตือนเกี่ยวกับบัญชีธนาคาร', 0, 27),
(109, 'ไวรัสที่ทำให้เครื่องทำงานช้าลง', 0, 28),
(110, 'การขโมยข้อมูลผ่านทางอีเมล', 0, 28),
(111, 'ซอฟต์แวร์ที่ใช้ข่มขู่ให้เหยื่อติดตั้งหรือซื้อผลิตภัณฑ์ปลอม', 1, 28),
(112, 'ซอฟต์แวร์ที่ช่วยเพิ่มความปลอดภัยให้กับระบบ', 0, 28),
(113, 'ป๊อปอัปแจ้งเตือนว่าคอมพิวเตอร์ติดไวรัส', 1, 29),
(114, 'ข้อความแจ้งเตือนการอัปเดตจาก Microsoft', 0, 29),
(115, 'โฆษณาสำหรับซอฟต์แวร์ความปลอดภัยที่ถูกต้อง', 0, 29),
(116, 'การแจ้งเตือนจากโปรแกรมป้องกันไวรัสจริง', 0, 29),
(117, 'lab-img1.png', 1, 31),
(118, '1,4', 1, 32),
(119, 'Se0ur1ty777', 1, 33),
(120, '2', 1, 34),
(121, '3', 1, 35),
(122, 'Beware of technical support scams that try to trick you into revealing your sensitive information.', 1, 36),
(123, 'This is a simulated attack. Do not download files from unknown sources.', 1, 37),
(125, 'การโจมตีโดยการเจาะระบบเครือข่ายโดยตรง', 0, 60),
(126, 'การโจมตีโดยใช้ไวรัสคอมพิวเตอร์', 0, 60),
(127, 'การโจมตีโดยใช้ทักษะทางเทคนิคขั้นสูง', 0, 60),
(128, 'เทคนิคการโจมตีทางไซเบอร์ที่ใช้การหลอกลวงทางจิตวิทยา', 1, 60),
(129, 'การสร้างความเสียหายทางกายภาพ', 0, 61),
(130, 'การเข้าถึงข้อมูลสำคัญของเหยื่อ', 1, 61),
(131, 'การโจมตีระบบเครือข่ายโดยตรง', 0, 61),
(132, 'การสร้างไวรัสคอมพิวเตอร์', 0, 61),
(133, 'การส่งอีเมลหลอกลวงให้เหยื่อเปิดลิงก์หรือไฟล์ที่มีมัลแวร์', 1, 62),
(134, 'การใช้โปรแกรมแฮ็กเพื่อเจาะระบบ', 0, 62),
(135, 'การโจมตี DDoS เพื่อทำให้ระบบล่ม', 0, 62),
(136, 'การใช้ไวรัสคอมพิวเตอร์เพื่อลบข้อมูล', 0, 62),
(137, 'ถูกนำไปใช้เพื่อสร้างไวรัสคอมพิวเตอร์', 0, 63),
(138, 'ถูกนำไปใช้เพื่อโจมตี DDoS', 0, 63),
(139, 'ถูกนำไปขายในตลาดมืด', 1, 63),
(140, 'ถูกนำไปใช้เพื่อลบข้อมูลในระบบ', 0, 63),
(141, 'การส่งอีเมลปลอมแปลงเป็นองค์กรที่เชื่อถือได้เพื่อหลอกให้เหยื่อเปิดเผยข้อมูลส่วนตัว', 1, 64),
(142, 'การสร้างเว็บไซต์ปลอมที่ดูเหมือนของจริงเพื่อให้เหยื่อป้อนข้อมูลส่วนตัว', 0, 64),
(143, 'การโจมตีผ่านข้อความ SMS โดยส่งลิงก์ปลอมหรือแจ้งเตือนปลอม', 0, 64),
(144, 'การโจมตีที่มุ่งเป้าหมายเฉพาะเจาะจง เช่น ผู้บริหารองค์กร', 0, 64),
(145, 'การสร้างเว็บไซต์ปลอมที่ดูเหมือนของจริง', 0, 65),
(146, 'การส่งอีเมลปลอมแปลงเป็นองค์กรที่เชื่อถือได้', 0, 65),
(147, 'การโจมตีผ่านข้อความ SMS', 0, 65),
(148, 'การโจมตีที่มุ่งเป้าหมายเฉพาะเจาะจง เช่น ผู้บริหารองค์กร', 1, 65),
(149, 'การส่งอีเมลปลอมแปลงเป็นองค์กรที่เชื่อถือได้', 0, 66),
(150, 'การสร้างเว็บไซต์ปลอมที่ดูเหมือนของจริง', 0, 66),
(151, 'การโจมตีผ่านข้อความ SMS โดยส่งลิงก์ปลอมหรือแจ้งเตือนปลอม', 1, 66),
(152, 'การโจมตีที่มุ่งเป้าหมายเฉพาะเจาะจง เช่น ผู้บริหารองค์กร', 0, 66),
(153, 'การขโมยข้อมูลส่วนตัว เช่น รหัสผ่านหรือเลขบัญชีธนาคาร', 1, 67),
(154, 'การสร้างความเสียหายทางกายภาพ', 0, 67),
(155, 'การลบข้อมูลทั้งหมดในระบบ', 0, 67),
(156, 'การทำให้ระบบเครือข่ายล่ม', 0, 67),
(157, 'เปิดไฟล์แนบหรือคลิกลิงก์ในอีเมลที่น่าสงสัย', 0, 68),
(158, 'ให้ที่อยู่อีเมลหรือเบอร์โทรศัพท์กับเว็บไซต์ที่ไม่น่าเชื่อถือ', 0, 68),
(159, 'ไม่ตั้งค่าความเป็นส่วนตัวในแอปพลิเคชัน', 0, 68),
(160, 'ใช้ตัวกรองสแปมในอีเมลหรือบล็อกเบอร์โทรศัพท์ที่ส่งข้อความสแปม', 1, 68),
(161, 'อีเมลโฆษณาสินค้า', 0, 69),
(162, 'ข้อความ SMS ที่เสนอขายผลิตภัณฑ์หรือมีลิงก์หลอกลวง', 1, 69),
(163, 'ข้อความที่ส่งผ่านทางแอปพลิเคชันแชท', 0, 69),
(164, 'ข้อความที่ส่งผ่านทางอีเมลเท่านั้น\r\n\r\n', 0, 69),
(165, 'การถูกขโมยข้อมูลส่วนตัว เช่น รหัสผ่านหรือข้อมูลทางการเงิน', 1, 70),
(166, 'การได้รับรางวัลจากลิงก์', 0, 70),
(167, 'การได้รับข้อความโฆษณาที่น่าสนใจ', 0, 70),
(168, 'การได้รับข้อมูลที่เป็นประโยชน์', 0, 70),
(169, 'ข้อเสนอที่ดูดีเกินจริง เช่น การแจกโปรแกรมฟรี', 1, 71),
(170, 'การส่งอีเมลปลอมแปลงเป็นองค์กรที่เชื่อถือได้', 0, 71),
(171, 'การโจมตีผ่านข้อความ SMS', 0, 71),
(172, 'การสร้างเว็บไซต์ปลอมที่ดูเหมือนของจริง', 0, 71),
(173, 'การโจมตีผ่านข้อความ SMS', 0, 72),
(174, 'การสร้างเว็บไซต์ปลอมที่ดูเหมือนของจริง', 0, 72),
(175, 'การวางแฟลชไดรฟ์ที่มีมัลแวร์ในสถานที่สาธารณะ', 1, 72),
(176, 'การส่งอีเมลปลอมแปลงเป็นองค์กรที่เชื่อถือได้', 0, 72),
(177, 'ดาวน์โหลดไฟล์หรือโปรแกรมจากแหล่งที่ไม่น่าเชื่อถือ', 0, 73),
(178, 'ไม่เสียบอุปกรณ์ที่ไม่รู้แหล่งที่มาเข้ากับคอมพิวเตอร์', 1, 73),
(179, 'คลิกที่ป๊อปอัพที่ไม่รู้จักบนเว็บไซต์', 0, 73),
(180, 'เชื่อข้อเสนอที่ดูดีเกินจริง', 0, 73),
(181, 'โพสต์ที่อ้างว่าให้รางวัลสำหรับการกดลิงก์หรือแชร์ต่อ', 1, 74),
(182, 'การวางแฟลชไดรฟ์ที่มีมัลแวร์ในสถานที่สาธารณะ', 0, 74),
(183, 'การส่งอีเมลปลอมแปลงเป็นองค์กรที่เชื่อถือได้', 0, 74),
(184, 'การสร้างเรื่องราวที่น่าเชื่อถือเพื่อหลอกลวงให้เหยื่อเปิดเผยข้อมูล', 1, 75),
(185, 'การส่งอีเมลปลอมแปลงเป็นองค์กรที่เชื่อถือได้', 0, 75),
(186, 'การสร้างเว็บไซต์ปลอมที่ดูเหมือนของจริง', 0, 75),
(187, 'การโจมตีผ่านข้อความ SMS', 0, 75),
(188, 'การโจมตีผ่านข้อความ SMS', 0, 76),
(189, 'การสร้างเว็บไซต์ปลอมที่ดูเหมือนของจริง', 0, 76),
(190, 'การส่งอีเมลปลอมแปลงเป็นองค์กรที่เชื่อถือได้', 0, 76),
(191, 'การแอบอ้างเป็นเจ้าหน้าที่ฝ่ายไอทีเพื่อขอข้อมูลสำคัญ', 1, 76),
(192, 'เชื่อข้อเสนอที่ดูดีเกินจริง', 0, 77),
(193, 'คลิกที่ป๊อปอัพที่ไม่รู้จักบนเว็บไซต์', 0, 77),
(194, 'ตรวจสอบข้อเท็จจริงก่อนให้ข้อมูล', 1, 77),
(195, 'ให้ข้อมูลสำคัญทางโทรศัพท์หรืออีเมล', 0, 77),
(196, 'การได้รับโปรแกรมฟรี', 0, 78),
(197, 'การได้รับรางวัลจากลิงก์', 0, 78),
(198, 'การได้รับข้อความโฆษณาที่น่าสนใจ', 0, 78),
(199, 'การถูกขโมยข้อมูลส่วนตัวหรือข้อมูลทางการเงิน', 1, 78),
(200, 'อย่าคลิกลิงก์ในข้อความหรืออีเมลที่ไม่น่าเชื่อถือ', 1, 79),
(201, 'ให้ข้อมูลส่วนตัวทันที', 0, 79),
(202, 'คลิกที่ป๊อปอัพที่ไม่รู้จักบนเว็บไซต์', 0, 79),
(203, 'เชื่อข้อเสนอที่ดูดีเกินจริง', 0, 79),
(204, 'ใช้การยืนยันตัวตนแบบสองชั้น (2FA)', 1, 80),
(205, 'ให้ข้อมูลส่วนตัวง่าย ๆ', 0, 80),
(206, 'คลิกที่ป๊อปอัพที่ไม่รู้จักบนเว็บไซต์', 0, 80),
(207, 'เชื่อข้อเสนอที่ดูดีเกินจริง', 0, 80),
(208, 'การโจมตีผ่านข้อความ SMS', 0, 81),
(209, 'การสร้างเว็บไซต์ปลอมที่ดูเหมือนของจริง', 0, 81),
(210, 'การปลอมเป็นเพื่อนในโซเชียลมีเดียเพื่อขอข้อมูลส่วนตัว', 1, 81),
(211, 'การส่งอีเมลปลอมแปลงเป็นองค์กรที่เชื่อถือได้', 0, 81),
(212, 'ตอบสนองต่อข้อความหรือป๊อปอัปแจ้งเตือนปลอม', 0, 82),
(213, 'ตรวจสอบตัวตนผู้โทร', 1, 82),
(214, 'ให้การเข้าถึงระยะไกล (Remote Access)', 0, 82),
(215, 'ติดต่อฝ่ายสนับสนุนโดยตรง', 1, 82),
(216, 'ตอบสนองต่อข้อความหรือป๊อปอัปแจ้งเตือนปลอม', 0, 83),
(217, 'ปิดหน้าต่างข้อความเตือนปลอมทันที', 1, 83),
(218, 'คลิกที่ป๊อปอัพที่ไม่รู้จักบนเว็บไซต์', 0, 83),
(219, 'เชื่อข้อเสนอที่ดูดีเกินจริง', 0, 83),
(220, 'ให้ข้อมูลส่วนตัวหรือรหัสผ่าน', 0, 84),
(221, 'เชื่อข้อเสนอที่ดูดีเกินจริง', 0, 84),
(222, 'คลิกที่ป๊อปอัพที่ไม่รู้จักบนเว็บไซต์', 0, 84),
(223, 'ตรวจสอบข้อมูลจากเว็บไซต์อย่างเป็นทางการ', 1, 84),
(224, 'ใช้โปรแกรมป้องกันไวรัสที่น่าเชื่อถือ', 1, 85),
(225, 'ตอบสนองต่อข้อความเตือนปลอม', 0, 85),
(226, 'คลิกที่ป๊อปอัพที่ไม่รู้จักบนเว็บไซต์', 0, 85),
(227, 'เชื่อข้อเสนอที่ดูดีเกินจริง', 0, 85),
(228, 'การได้รับโปรแกรมฟรี', 0, 86),
(229, 'การได้รับรางวัลจากลิงก์', 0, 86),
(230, 'การได้รับข้อความโฆษณาที่น่าสนใจ', 0, 86),
(231, 'การถูกติดตั้งมัลแวร์หรือถูกขโมยข้อมูล', 1, 86),
(232, 'ปิดหน้าต่างข้อความเตือนปลอมทันที', 1, 87),
(233, 'คลิกที่ป๊อปอัพที่ไม่รู้จักบนเว็บไซต์', 0, 87),
(234, 'ตอบสนองต่อข้อความเตือนปลอม', 0, 87),
(235, 'เชื่อข้อเสนอที่ดูดีเกินจริง', 0, 87);

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `icon_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `teacherId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`id`, `name`, `icon_id`, `teacherId`) VALUES
(1, 'Cyber Security - Social Engineering', 'icon.png', 19);

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `id` int NOT NULL,
  `courseId` int NOT NULL,
  `pretest_complete` tinyint(1) NOT NULL DEFAULT '0',
  `posttest_complete` tinyint(1) NOT NULL DEFAULT '0',
  `completed_labs` int NOT NULL,
  `total_labs` int NOT NULL,
  `userId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `enrollment`
--

INSERT INTO `enrollment` (`id`, `courseId`, `pretest_complete`, `posttest_complete`, `completed_labs`, `total_labs`, `userId`) VALUES
(38, 1, 1, 0, 1, 7, 18);

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `id` int NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `score` int NOT NULL DEFAULT '0',
  `questionId` int NOT NULL,
  `enrollmentId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `progress`
--

INSERT INTO `progress` (`id`, `is_completed`, `score`, `questionId`, `enrollmentId`) VALUES
(799, 1, 1, 2, 38),
(800, 1, 1, 6, 38),
(801, 1, 1, 11, 38),
(802, 1, 0, 19, 38),
(803, 1, 0, 23, 38),
(804, 1, 0, 24, 38),
(805, 1, 0, 26, 38),
(806, 1, 0, 28, 38),
(807, 1, 1, 31, 38),
(808, 0, 0, 32, 38),
(809, 0, 0, 33, 38),
(810, 0, 0, 34, 38),
(811, 0, 0, 35, 38),
(812, 0, 0, 36, 38),
(813, 0, 0, 37, 38),
(814, 0, 0, 61, 38),
(815, 0, 0, 66, 38),
(816, 0, 0, 68, 38),
(817, 0, 0, 73, 38),
(818, 0, 0, 77, 38),
(819, 0, 0, 80, 38),
(820, 0, 0, 83, 38),
(821, 0, 0, 86, 38);

-- --------------------------------------------------------

--
-- Table structure for table `question`
--

CREATE TABLE `question` (
  `id` int NOT NULL,
  `content` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `subjectId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `question`
--

INSERT INTO `question` (`id`, `content`, `type`, `subjectId`) VALUES
(1, 'Social Engineering ใช้วิธีใดเพื่อเข้าถึงข้อมูลสำคัญของเหยื่อ?', 'pre', 6),
(2, 'ข้อมูลใดที่มักตกเป็นเป้าหมายของ Social Engineering?', 'pre', 6),
(3, 'ทำไม Social Engineering ถึงเป็นวิธีที่มีประสิทธิภาพในการขโมยข้อมูล?', 'pre', 6),
(4, 'วิธีใดที่ช่วยป้องกันการถูกโจมตีด้วย Social Engineering?', 'pre', 6),
(5, 'ผู้โจมตีมักใช้วิธีไหนเพื่อให้เหยื่อเปิดเผยข้อมูลสำคัญ?', 'pre', 6),
(6, 'การโจมตีแบบ Phishing มีลักษณะอย่างไร?', 'pre', 7),
(7, 'อะไรเป็นวิธีป้องกันการโจมตีแบบ Phishing ที่ดีที่สุด?', 'pre', 7),
(8, 'ข้อใดเป็นตัวอย่างของอีเมล Phishing?', 'pre', 7),
(9, 'อีเมลที่เป็น Phishing มักมีลักษณะอย่างไร?', 'pre', 7),
(10, 'ทำไมผู้โจมตีถึงใช้ Phishing?', 'pre', 7),
(11, 'ข้อใดเป็นตัวอย่างของ SPAM?', 'pre', 8),
(12, 'SPAM สามารถเกิดขึ้นได้ในช่องทางใดบ้าง?', 'pre', 8),
(13, 'ข้อใดเป็นวิธีที่ดีที่สุดในการลดปริมาณ SPAM?', 'pre', 8),
(14, 'SPAM อาจส่งผลกระทบต่อผู้ใช้ในลักษณะใด?', 'pre', 8),
(15, 'ทำไม SPAM จึงเป็นปัญหาใหญ่ในโลกไซเบอร์?', 'pre', 8),
(16, 'การโจมตีแบบ Baiting มีลักษณะอย่างไร?', 'pre', 9),
(17, 'ตัวอย่างของ Baiting ที่พบได้ทั่วไปคืออะไร?', 'pre', 9),
(18, 'ผู้โจมตีมักใช้ Baiting เพื่ออะไร?', 'pre', 9),
(19, 'ข้อใดเป็นวิธีป้องกันการโจมตีแบบ Baiting?', 'pre', 9),
(20, 'ตัวอย่างของ Pretexting คืออะไร?', 'pre', 10),
(21, 'เป้าหมายหลักของ Pretexting คืออะไร?', 'pre', 10),
(22, 'วิธีป้องกันการโจมตีแบบ Pretexting คืออะไร?', 'pre', 10),
(23, 'ข้อใดเป็นสัญญาณของ Pretexting?', 'pre', 10),
(24, 'Impersonation ใน Social Engineering คืออะไร?', 'pre', 11),
(25, 'ผู้โจมตีมักใช้วิธีไหนในการ Impersonation?', 'pre', 11),
(26, 'Technical Support Scams คืออะไร?', 'pre', 12),
(27, 'วิธีที่ Technical Support Scams ใช้บ่อยคืออะไร?', 'pre', 12),
(28, 'Scareware คืออะไร?', 'pre', 13),
(29, 'Scareware มักแสดงผลในรูปแบบใด?', 'pre', 13),
(31, 'จากภาพ lab-img1.png และ lab-img2.png จงบอกว่าภาพไหนคือ email ที่เป็นการ Email Phishing \r\n*กรุณาตอบชื่อ พร้อมนามสกุลไฟล์เต็ม เช่น image.png\r\n**หมายเหตุ: สามารถดูรูปได้ที่บริเวณด้านบนเนื้อหาที่แสดงรูป กดลูกศรเพื่อเปลี่ยนรูปภาพ**', 'lab', 7),
(32, 'จากประเภทของ Spam (Email Spam, SMS Spam, Application Spam) มีวิธีการหลักที่เหมือนกันทั้งหมด และสื่อกลางที่ใช้แสดงข้อมูลที่จะหลอกล่อต่างกันคืออะไร?\r\nจงเลือกตัวเลขจากตัวเลือกเหล่านี้ไปกรอกในช่องตอบคำถามตามรูปแบบต่อไปนี้ \r\nตัวเลือกวิธีการที่เหมือนกัน,ตัวเลือกสื่อกลางที่ใช้แสดงข้อมูล เช่น 1,2\r\n\r\n-ตัวเลือกวิธีการที่เหมือนกัน : 1.ส่งในปริมาณมาก, 2.ส่งครั้งเดียว, 3.แจ้งเตือนให้ผู้พบคิดว่าติดไวรัส\r\n-ตัวเลือกสื่อกลางที่ใช้แสดงข้อมูล : 1.อีเมล, 2.SMS, 3.แอปพลิเคชันแชท, 4.ถูกทั้ง 1 2 และ 3', 'lab', 8),
(33, 'เมื่อกด start จะเป็นเว็บจำลองที่มี popup baiting ให้คุณเห็นคุณต้องทำบางอย่างกับ popup เพื่อนำรหัสผ่านหลังข้อความต่อไปนี้มาตอบลงในช่องตอบคำถาม \r\n*Please take this password: ข้อความบางอย่าง*\r\nคำตอบที่ต้องตอบคือ ข้อความบางอย่าง', 'lab-w', 9),
(34, 'สถานการณ์: คุณได้รับอีเมลจากธนาคารแจ้งว่าบัญชีของคุณถูกระงับชั่วคราว และขอให้คุณคลิกลิงก์เพื่อยืนยันตัวตน\r\n\r\nคำถาม: อีเมลนี้มีลักษณะใดที่บ่งชี้ว่าเป็น Pretexting จงเลือกตัวเลขจากตัวเลือกเหล่านี้มาตอบลงในช่องตอบคำถาม *****ตอบแค่ตัวเลขข้างหน้าตัวเลือก\r\n\r\n1.อีเมลมาจากที่อยู่อีเมลของธนาคารที่คุณรู้จัก\r\n2.อีเมลมีลิงก์ให้คลิกเพื่อยืนยันตัวตน\r\n3.อีเมลแจ้งว่าคุณต้องดำเนินการภายใน 24 ชั่วโมง\r\n4.อีเมลมีข้อความที่เขียนอย่างเป็นทางการ', 'lab', 10),
(35, 'สถานการณ์: คุณได้รับอีเมลจากเพื่อนร่วมงานที่อ้างว่าตกอยู่ในสถานการณ์ฉุกเฉินและขอให้คุณโอนเงินด่วน\r\n\r\nคำถาม: อีเมลนี้มีลักษณะใดที่บ่งชี้ว่าเป็น Impersonation Email? จงเลือกตัวเลขจากตัวเลือกเหล่านี้มาตอบลงในช่องตอบคำถาม *****ตอบแค่ตัวเลขข้างหน้าตัวเลือก\r\n\r\n1.อีเมลมาจากที่อยู่อีเมลของเพื่อนร่วมงานที่คุณรู้จัก\r\n2.อีเมลมีลิงก์ให้คลิกเพื่อโอนเงิน\r\n3.อีเมลแจ้งว่าคุณต้องโอนเงินทันที\r\n4.อีเมลเขียนอย่างเป็นทางการ', 'lab', 11),
(36, 'เมื่อกด start จะเป็นเว็บจำลองที่มี popup ให้คุณเห็นและต้องทำบางอย่างกับ popup เพื่อนำข้อความที่อยู่บนเว็บซึ่งได้หลังจากทำบางอย่างกับ popup มากรอกลงในช่องตอบคำถาม\r\n*ข้อความที่ใช่ตอบในช่องตอบคำถามไม่ใช่ตัวหนา เป็นแค่ตัวอักษณธรรมดา*', 'lab-w', 12),
(37, 'เมื่อกด start จะเป็นเว็บจำลองที่มี popup ให้คุณเห็นและต้องทำบางอย่างกับ popup เพื่อนำข้อความที่อยู่บนเว็บซึ่งได้หลังจากทำบางอย่างกับ popup มากรอกลงในช่องตอบคำถาม\r\n*ข้อความที่ใช่ตอบในช่องตอบคำถามไม่ใช่ตัวหนา เป็นแค่ตัวอักษณธรรมดา*', 'lab-w', 13),
(60, 'Social Engineering คืออะไร?', 'post', 6),
(61, 'เป้าหมายหลักของ Social Engineering คืออะไร?', 'post', 6),
(62, 'ข้อใดคือตัวอย่างของการโจมตีด้วย Social Engineering?', 'post', 6),
(63, 'ข้อมูลที่ถูกขโมยจาก Social Engineering มักถูกนำไปใช้อย่างไร?', 'post', 6),
(64, 'ข้อใดคือตัวอย่างของ Email Phishing?', 'post', 7),
(65, 'ข้อใดคือลักษณะของ Spear Phishing?', 'post', 7),
(66, 'ข้อใดคือตัวอย่างของ Smishing?', 'post', 7),
(67, 'ข้อใดคือผลกระทบที่อาจเกิดขึ้นจากการโจมตีด้วย Phishing?', 'post', 7),
(68, 'ข้อใดคือวิธีรับมือกับ Spam?', 'post', 8),
(69, 'ข้อใดคือตัวอย่างของ SMS Spam?', 'post', 8),
(70, 'ข้อใดคือผลกระทบที่อาจเกิดขึ้นจากการเปิดลิงก์ใน Spam?', 'post', 8),
(71, 'ข้อใดคือลักษณะของ Baiting?', 'post', 9),
(72, 'ข้อใดคือตัวอย่างของ Baiting?', 'post', 9),
(73, 'ข้อใดคือวิธีรับมือกับ Baiting?', 'post', 9),
(74, 'ข้อใดคือตัวอย่างของ Baiting บนโซเชียลมีเดีย?', 'post', 9),
(75, 'ข้อใดคือลักษณะของ Pretexting?', 'post', 10),
(76, 'ข้อใดคือตัวอย่างของ Pretexting?', 'post', 10),
(77, 'ข้อใดคือวิธีป้องกัน Pretexting?', 'post', 10),
(78, 'ข้อใดคือผลกระทบที่อาจเกิดขึ้นจากการตกเป็นเหยื่อของ Pretexting?\r\n', 'post', 10),
(79, 'ข้อใดคือข้อควรระวังเมื่อได้รับข้อความหรืออีเมลที่ไม่น่าเชื่อถือ?', 'post', 11),
(80, 'ข้อใดคือวิธีการเพิ่มความปลอดภัยให้กับบัญชีออนไลน์?', 'post', 11),
(81, 'ข้อใดคือตัวอย่างของ Impersonation บนโซเชียลมีเดีย?', 'post', 11),
(82, 'ข้อใดคือวิธีป้องกัน Technical Support Scams?', 'post', 12),
(83, 'ข้อใดคือข้อควรระวังเมื่อได้รับข้อความหรือป๊อปอัปแจ้งเตือนปลอม?', 'post', 12),
(84, 'ข้อใดคือข้อควรระวังเมื่อได้รับสายจากฝ่ายสนับสนุนที่ไม่คุ้นเคย?', 'post', 12),
(85, 'ข้อใดคือวิธีป้องกัน Scareware?', 'post', 13),
(86, 'ข้อใดคือผลกระทบที่อาจเกิดขึ้นจากการตกเป็นเหยื่อของ Scareware?', 'post', 13),
(87, 'ข้อใดคือข้อควรระวังเมื่อพบข้อความเตือนปลอม?', 'post', 13);

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `images` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `courseId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`id`, `name`, `images`, `courseId`) VALUES
(6, 'Social Engineering', 'image.png', 1),
(7, 'Phishing', 'simage1.png, simage2.png, lab-img1.png, lab-img2.png', 1),
(8, 'SPAM', 'image.png', 1),
(9, 'Baiting', 'image.png', 1),
(10, 'Pretexting', 'image.png', 1),
(11, 'Impersonation', 'image.png', 1),
(12, 'Technical Support Scams', 'image.png', 1),
(13, 'Scareware', 'image.png', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `role` char(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `profile_img` mediumtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin,
  `verified_key` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `verified_expired` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `name`, `role`, `profile_img`, `verified_key`, `verified_expired`) VALUES
(18, 'arcarnupab@gmail.com', '$2b$10$0bpRvf..aYDN.p8P45nQd.qiKZSIVeCVfLCYwTuOwCX7dQY2Ywop6', 'inwarc', 's', 'data:image/jpeg;base64,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', '2976024cf73698fac5a4f747f54879113f31bdf52f55c80d6d02c1a866c19873', '2025-03-10 12:36:30');
INSERT INTO `user` (`id`, `email`, `password`, `name`, `role`, `profile_img`, `verified_key`, `verified_expired`) VALUES
(19, 'arnupab0808@gmail.com', '$2b$10$0qBdjOZlgyjM/xxHb5yvnOqyUXQXSRFNiiDdDnMI9K0GrbkVjjg..', 'teach1', 't', NULL, '66a157f062c5e32800db3be93f63f9304913d8bda56fd503def9099905afb42e', '2025-03-10 11:12:06'),
(20, 'tae8.arnupab@gmail.com', '$2b$10$eO0hLCgwKd9trJLop1h9MeK4.WS5M524s9BLyaKboA0IJ2vM6eSBW', 'adminTest', 'a', NULL, '8293b5e51ab6b36acf5644018137573c3b01fe1e4981504d8207ede091219779', '2025-03-10 11:11:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `answer`
--
ALTER TABLE `answer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `answer_question` (`questionId`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teach_course` (`teacherId`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner` (`userId`),
  ADD KEY `enroll_course` (`courseId`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `enrol_progress` (`enrollmentId`),
  ADD KEY `question_progress` (`questionId`);

--
-- Indexes for table `question`
--
ALTER TABLE `question`
  ADD PRIMARY KEY (`id`),
  ADD KEY `in_subject` (`subjectId`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`id`),
  ADD KEY `in_course` (`courseId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answer`
--
ALTER TABLE `answer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=348;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=833;

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answer`
--
ALTER TABLE `answer`
  ADD CONSTRAINT `answer_question` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `teach_course` FOREIGN KEY (`teacherId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `enroll_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`),
  ADD CONSTRAINT `owner` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `enrol_progress` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `question_progress` FOREIGN KEY (`questionId`) REFERENCES `question` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `question`
--
ALTER TABLE `question`
  ADD CONSTRAINT `in_subject` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `in_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
