-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Feb 28, 2025 at 10:38 AM
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
(117, 'zaza57319', 1, 31),
(118, 'Pa55w0rd55', 1, 32),
(119, 'Se0ur1ty777', 1, 33),
(120, 'Your IT administrator has verified your details successfully.', 1, 34),
(121, '<head>Password Reset Successful</head><text>Your password has been reset successfully. You may now log in with your new password.</text>', 1, 35),
(122, '<head>Critical System Error</head><text>Your computer has encountered a serious error. Please click the button below to fix the issue and protect your system.</text>', 1, 36),
(123, 'This is a security file download for eliminate viruses.', 1, 37);

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `detail` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `icon_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `teacherId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`id`, `name`, `detail`, `icon_id`, `teacherId`) VALUES
(1, 'Cyber Security - Social Engineering', 'หลักสูตรเกี่ยวกับ Social Engineering และวิธีรับมือป้องกันจากการโจมตี', 'icon.png', 19);

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
(23, 1, 1, 0, 0, 7, 18);

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
(481, 1, 0, 1, 23),
(482, 1, 1, 9, 23),
(483, 1, 1, 13, 23),
(484, 1, 0, 18, 23),
(485, 1, 0, 22, 23),
(486, 1, 1, 25, 23),
(487, 1, 0, 26, 23),
(488, 1, 0, 28, 23),
(489, 0, 0, 31, 23),
(490, 0, 0, 32, 23),
(491, 0, 0, 33, 23),
(492, 0, 0, 34, 23),
(493, 0, 0, 35, 23),
(494, 0, 0, 36, 23),
(495, 0, 0, 37, 23),
(496, 0, 0, 40, 23),
(497, 0, 0, 41, 23),
(498, 0, 0, 43, 23),
(499, 0, 0, 47, 23),
(500, 0, 0, 51, 23),
(501, 0, 0, 52, 23),
(502, 0, 0, 57, 23),
(503, 0, 0, 59, 23);

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
(31, 'จงหารหัสคำตอบจาก Email ที่ไม่ใช่รูปแบบของ Email Phishing \r\n*หมายเหตุ: ไฟล์จำลองเริ่มทดสอบจากไฟล์ index.html', 'lab', 7),
(32, 'จงหารหัสคำตอบจาก Email ที่ถูกส่งมาโดยมีรูปแบบที่ไม่ใช่ Email Spam\r\n*หมายเหตุ: ไฟล์จำลองเริ่มทดสอบจากไฟล์ index.html', 'lab', 8),
(33, 'จงหาคำตอบจากไฟล์ที่ได้จาก Email และค้นหาคำตอบจากไฟล์ที่ไม่ใช่ Baiting \r\n*หมายเหตุ: ไฟล์จำลองเริ่มทดสอบจากไฟล์ index.html', 'lab-w', 9),
(34, 'จงหาคำตอบจากข้อความทั้งหมดในหน้า Email Notifications \r\nโดยนำข้อความจาก Email ที่คาดว่าเป็น Pretexting\r\n*หมายเหตุ: ไฟล์จำลองเริ่มทดสอบจากไฟล์ index.html', 'lab', 10),
(35, 'จงหาคำตอบจากข้อความทั้งหมดในหน้า Email Notifications \r\nโดยนำข้อความและหัวข้อจาก Email ที่ไม่เป็น Impersonation\r\n*หมายเหตุ: ไฟล์จำลองเริ่มทดสอบจากไฟล์ index.html\\r\\nรูปแบบคำตอบคือ <head>หัวข้อ</head><text>ข้อความ</text>', 'lab', 11),
(36, 'จงหาคำตอบจากข้อความทั้งหมดในหน้า Notifications\r\nโดยนำข้อความและหัวข้อจาก Email ที่คาดว่าเป็น Technical Support Scams\r\n*หมายเหตุ: ไฟล์จำลองเริ่มทดสอบจากไฟล์ index.html \r\nรูปแบบคำตอบคือ <head>หัวข้อ</head><text>ข้อความ</text>', 'lab-w', 12),
(37, 'จงหาคำตอบจากไฟล์ที่ได้จากการดาวน์โหลดใน Email จากหน้า Notifications\r\nโดยนำข้อความจากไฟล์ที่คาดว่าไม่เป็น Scareware มาตอบลงในช่องตอบคำถาม\r\n*หมายเหตุ: ไฟล์จำลองเริ่มทดสอบจากไฟล์ index.html ', 'lab-w', 13),
(38, 'testquestion', 'post', 6),
(39, 'testquestion', 'post', 6),
(40, 'testquestion', 'post', 6),
(41, 'testquestion', 'post', 7),
(42, 'testquestion', 'post', 7),
(43, 'Spam Post Questoin', 'post', 8),
(44, 'Spam Post Questoin', 'post', 8),
(45, 'Spam Post Questoin', 'post', 8),
(46, 'Spam Post Questoin', 'post', 8),
(47, 'Baiting Post Question', 'post', 9),
(48, 'Baiting Post Question', 'post', 9),
(49, 'Baiting Post Question', 'post', 9),
(50, 'Pretexting Post Question', 'post', 10),
(51, 'Pretexting Post Question', 'post', 10),
(52, 'Impersonation Post Question', 'post', 11),
(53, 'Impersonation Post Question', 'post', 11),
(54, 'Technical Support Scams Post Question', 'post', 12),
(55, 'Technical Support Scams Post Question', 'post', 12),
(56, 'Technical Support Scams Post Question', 'post', 12),
(57, 'Technical Support Scams Post Question', 'post', 12),
(58, 'Scareware Post Question', 'post', 13),
(59, 'Scareware Post Question', 'post', 13);

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `images` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `courseId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`id`, `name`, `images`, `courseId`) VALUES
(6, 'Social Engineering', 'image.png', 1),
(7, 'Phishing', 'simage1.png, simage2.png', 1),
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
  `profile_img` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `verified_key` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `verified_expired` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `name`, `role`, `profile_img`, `verified_key`, `verified_expired`) VALUES
(18, 'arcarnupab@gmail.com', '$2b$10$0bpRvf..aYDN.p8P45nQd.qiKZSIVeCVfLCYwTuOwCX7dQY2Ywop6', 'inwarc', 's', NULL, '0f7eb43874cd56b0706cff468c066f2c04237181ff5d28cbff8b980eba15502e', '2025-02-28 13:53:00'),
(19, 'arnupab0808@gmail.com', '$2b$10$uP6HRXVvlhnS.BwXEt.MMO4TdYKjDnyxk1QaLhaYBhbEp8K1W.W6C', 'teach1', 't', NULL, 'eaa3bf615dcaae7baf4bac837ff94a9c61496e1ccacc66a7455543f02c646a3e', '2025-02-22 16:49:13'),
(20, 'tae8.arnupab@gmail.com', '$2b$10$eO0hLCgwKd9trJLop1h9MeK4.WS5M524s9BLyaKboA0IJ2vM6eSBW', 'adminTest', 'a', NULL, '47fdf2f505fcab48e43da645bcf295ce5584063866b3f75b1f1870470e7b0f8d', '2025-02-26 18:07:36');

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=504;

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
