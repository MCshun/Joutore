-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: kabu_app
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `score_settings`
--

DROP TABLE IF EXISTS `score_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `score_settings` (
  `user_id` int(11) NOT NULL,
  `stock_id` int(11) DEFAULT 1,
  `tenkan_kijun_score` int(11) DEFAULT NULL,
  `chikou_candle_score` int(11) DEFAULT NULL,
  `price_above_kumo_score` int(11) DEFAULT NULL,
  `golden_cross_score` int(11) DEFAULT NULL,
  `dead_cross_score` int(11) DEFAULT NULL,
  `price_above_ma_score` int(11) DEFAULT NULL,
  `price_below_ma_score` int(11) DEFAULT NULL,
  `bb_break_upper_score` int(11) DEFAULT NULL,
  `bb_break_lower_score` int(11) DEFAULT NULL,
  `rsi_over70_score` int(11) DEFAULT NULL,
  `rsi_under30_score` int(11) DEFAULT NULL,
  `macd_above_signal_score` int(11) DEFAULT NULL,
  `macd_below_signal_score` int(11) DEFAULT NULL,
  `total_score` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `score_settings`
--

LOCK TABLES `score_settings` WRITE;
/*!40000 ALTER TABLE `score_settings` DISABLE KEYS */;
INSERT INTO `score_settings` VALUES (0,1,8,7,9,7,-7,5,-5,4,-4,3,-3,7,-7,40),(1,1,8,6,9,7,-7,5,-5,4,-6,3,-3,7,-7,315);
/*!40000 ALTER TABLE `score_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `symbol` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trend-settings`
--

DROP TABLE IF EXISTS `trend-settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trend-settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'users テーブル or session の user_id',
  `threshold_rising` int(11) NOT NULL DEFAULT 20 COMMENT '上昇トレンドしきい値',
  `threshold_falling` int(11) NOT NULL DEFAULT -20 COMMENT '下降トレンドしきい値',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_user` (`user_id`),
  CONSTRAINT `trend-settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trend-settings`
--

LOCK TABLES `trend-settings` WRITE;
/*!40000 ALTER TABLE `trend-settings` DISABLE KEYS */;
INSERT INTO `trend-settings` VALUES (1,1,50,25,'2025-06-24 14:44:39');
/*!40000 ALTER TABLE `trend-settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'shunsei','shun@example.com','$2b$10$IDzhrAUBLaAf.epucOwAR.FzKfNkD6EVBYUVLjoRZAZVqRW4Uisn2','2025-06-13 06:33:38'),(35,'syuu_0814','shunsei0814@icloud.com','$2b$10$LpYBwR.XLmh7md1EnVQmFuhOrXo/os3KHjbOpJ28HZb2/o49.bLGG','2025-06-23 05:09:51'),(37,'shunsei0814','shunsei0814@iclou','$2b$10$zz5i2v4C/STZzXKfPhnxhO7TYsWiN7k2/iokol4XBMz.I4Tubt5Se','2025-06-23 05:12:49'),(39,'78859830','shunsei0814@icl','$2b$10$APHUUT.xYhngEBQt8q1rr.KHjV.JNM0Ie8MTVkSUopW6Ql0B.c/l2','2025-06-23 05:13:24'),(41,'78859830','s@icloud.com','$2b$10$OfKW4hkIUuuzKm8vrtD7h.v7JLJAd6X0LV/qrdAl.uR3Fmcmp9Ko2','2025-06-23 05:17:35'),(43,'shunsei0814','shun@icloud.com','$2b$10$1lm4ZVFCQa.nY0F9PAD28uqFBIDqfv3/N3fnqxdcsYqoEofgVV2Fe','2025-06-23 05:31:45'),(44,'shunsei','shu@icloud.com','$2b$10$9y0RN2te68l09nnBwPJoq.7jktvCIUBWAK2JnxPsepunCeCrfyRs6','2025-06-23 05:32:22'),(45,'1','1@1','$2b$10$KeTA/dAhIYPeM7vSakow/uYUJWs2/uOssKt3VNyIZcjEwC3tSJOA2','2025-06-24 05:59:59');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchlist`
--

DROP TABLE IF EXISTS `watchlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchlist`
--

LOCK TABLES `watchlist` WRITE;
/*!40000 ALTER TABLE `watchlist` DISABLE KEYS */;
INSERT INTO `watchlist` VALUES (74,35,'カリタ','2025-06-23 06:26:27'),(75,1,'カリタ','2025-06-26 03:29:25'),(76,1,'カリー','2025-06-26 03:29:26');
/*!40000 ALTER TABLE `watchlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-30  8:38:31
