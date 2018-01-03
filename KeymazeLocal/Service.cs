using KeymazeLocal.Model;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KeymazeLocal
{
    public static class Service
    {
        public static void OpenDataBase()
        {
            string path = "";
            string currentDir = "";
            try
            {
#if DEBUG
                    if (Environment.Is64BitOperatingSystem)
                        currentDir = "C:\\Program Files (x86)\\KeyMaze\\";
                    else
                        currentDir = "C:\\Program Files\\KeyMaze\\";
#else
                    Assembly assembly = Assembly.GetExecutingAssembly();
                    currentDir = System.IO.Path.GetDirectoryName(assembly.Location) + "\\";
#endif

                path = currentDir + "Keymaze.db";
                if (!File.Exists(path))
                    throw new Exception("BDDPathFile " + path + " chemin incorrect");
                DataBase.Close();
                DataBase.Init(path);
                DataBase.Connect();
            }
            catch (Exception ex)
            {
                File.WriteAllText("C:\\Program Files (x86)\\KeyMaze\\Erreur.txt", ex.Message);
                throw new Exception();
            }
        }

        public static List<Performance> GetPerformances()
        {
            String l_strRequete = "";
            try
            {
                List<Performance> lstPerformances = new List<Performance>();

                l_strRequete = "SELECT KEYMAZE.K_PRIMAIRE, SPORT.P_SPORT, LIEU.L_LIEU, SOUS_LIEU.S_LIEU,TYPE.T_TYPE, TYPE.T_COULEUR ";
                l_strRequete += ", KEYMAZE.K_DATE_PERF, KEYMAZE.K_TEMPS, KEYMAZE.K_DISTANCE, KEYMAZE.K_VITMOY, KEYMAZE.K_VITMAX, KEYMAZE.K_COMMENT, KEYMAZE.K_GPS, KEYMAZE.K_URL ";
                l_strRequete += ",KEYMAZE.K_KEY_SPORT, KEYMAZE.K_KEY_LIEU, KEYMAZE.K_KEY_SOUSLIEU, KEYMAZE.K_KEY_TYPE ";
                l_strRequete += "FROM (SPORT INNER JOIN (LIEU INNER JOIN (KEYMAZE LEFT JOIN SOUS_LIEU ON KEYMAZE.K_KEY_SOUSLIEU = SOUS_LIEU.S_PRIMAIRE) ON LIEU.L_PRIMAIRE = KEYMAZE.K_KEY_LIEU) ON SPORT.P_PRIMAIRE = KEYMAZE.K_KEY_SPORT) LEFT JOIN TYPE ON KEYMAZE.K_KEY_TYPE = TYPE.T_PRIMAIRE";

                DataBase.ExecuteReader(l_strRequete);
                while (DataBase.Read())
                {
                    lstPerformances.Add(new Performance()
                    {
                        K_primaire = DataBase.getInt(0),
                        P_sport = DataBase.getString(1),
                        L_lieu = DataBase.getString(2),
                        S_lieu = DataBase.getString(3),
                        T_type = DataBase.getString(4),
                        T_couleur = DataBase.getDouble(5),
                        K_date_perf = DataBase.getDate(6),
                        K_temps = DataBase.getInt(7),
                        K_distance = DataBase.getInt(8),
                        K_vitmoy = DataBase.getDecimal(9),
                        K_vitmax = DataBase.getDouble(10),
                        K_comment = DataBase.getString(11),
                        K_gps = DataBase.getString(12),
                        K_url = DataBase.getString(13),
                        K_Key_Sport = DataBase.getInt(14),
                        K_Key_Lieu = DataBase.getInt(15),
                        K_Key_Souslieu = DataBase.getInt(16),
                        K_Key_Type = (int)DataBase.getDouble(17)
                    }
                    );
                }
                return lstPerformances;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static InfoPerformance GetInfoPerformance()
        {
            InfoPerformance l_objInfoPerformance = new InfoPerformance();

            String l_strRequete = "";
            List<Sport> lstSports = new List<Sport>();

            l_strRequete = "SELECT P_PRIMAIRE, P_SPORT FROM SPORT";

            DataBase.ExecuteReader(l_strRequete);
            while (DataBase.Read())
            {
                lstSports.Add(new Sport()
                {
                    P_primaire = DataBase.getInt(0),
                    P_sport = DataBase.getString(1)
                });
            }
            l_objInfoPerformance.ListeSports = lstSports;

            List<Lieu> lstLieux = new List<Lieu>();
            l_strRequete = "SELECT L_PRIMAIRE, L_LIEU FROM LIEU";

            DataBase.ExecuteReader(l_strRequete);
            while (DataBase.Read())
            {
                lstLieux.Add(new Lieu()
                {
                    L_primaire = DataBase.getInt(0),
                    L_lieu = DataBase.getString(1)
                });
            }
            l_objInfoPerformance.ListeLieux = lstLieux;

            List<SousLieu> lstSousLieux = new List<SousLieu>();
            l_strRequete = "SELECT S_PRIMAIRE, S_KEY_LIEU, S_LIEU FROM SOUS_LIEU";

            DataBase.ExecuteReader(l_strRequete);
            while (DataBase.Read())
            {
                lstSousLieux.Add(new SousLieu()
                {
                    S_primaire = DataBase.getInt(0),
                    S_key_lieu = DataBase.getInt(1),
                    S_lieu = DataBase.getString(2)
                });
            }
            l_objInfoPerformance.ListeSousLieux = lstSousLieux;

            List<TypePerformance> lstTypesPerformance = new List<TypePerformance>();

            l_strRequete = "SELECT T_PRIMAIRE, T_TYPE, T_COULEUR FROM TYPE";

            DataBase.ExecuteReader(l_strRequete);
            while (DataBase.Read())
            {
                lstTypesPerformance.Add(new TypePerformance()
                {
                    T_primaire = DataBase.getInt(0),
                    T_type = DataBase.getString(1),
                    T_couleur = DataBase.getInt(2)
                });
            }
            l_objInfoPerformance.ListeTypePerformances = lstTypesPerformance;

            return l_objInfoPerformance;
        }

        public static void InsertPerformance(Performance performance)
        {
            if (performance == null)
                throw new ArgumentNullException("Performance");
            if (performance.K_Key_Sport == null || performance.K_Key_Sport == 0)
                throw new ArgumentNullException("Sport");
            if (performance.K_Key_Lieu == null || performance.K_Key_Lieu == 0)
                throw new ArgumentNullException("Lieu");
            if (performance.K_temps == null || performance.K_temps == 0)
                throw new ArgumentNullException("Temps");
            if (performance.K_distance == null || performance.K_distance == 0)
                throw new ArgumentNullException("Distance");
            if (performance.K_vitmoy == null || performance.K_vitmoy == 0)
                throw new ArgumentNullException("Vitesse moyenne");
            if (performance.K_date_perf == null || performance.K_date_perf == DateTime.MinValue)
                throw new ArgumentNullException("Date");
            if (string.IsNullOrEmpty(performance.K_gps))
                throw new ArgumentNullException("GPS");

            //On vérifie que l'enregistrement n'existe pas
            if (DataBase.ExecuteScalar<long>("SELECT COUNT(*) AS COMPTE FROM KEYMAZE WHERE K_DATE_PERF ='" + performance.K_date_perf.Value.ToString("yyyy-MM-dd HH:mm:ss") + "'") > 0)
                throw new Exception("Cet enregistrement est déjà présent dans la base");

            String l_strRequete = "";
            try
            {
                l_strRequete = "INSERT INTO KEYMAZE(K_KEY_SPORT,K_KEY_LIEU,K_KEY_SOUSLIEU,K_KEY_TYPE,K_TEMPS,K_DISTANCE,K_VITMOY,K_VITMAX,K_COMMENT,K_DATE_PERF,K_GPS,K_URL)";
                l_strRequete += "VALUES(";
                l_strRequete += performance.K_Key_Sport + ",";
                l_strRequete += performance.K_Key_Lieu + ",";
                l_strRequete += performance.K_Key_Souslieu + ",";
                l_strRequete += performance.K_Key_Type + ","; //Type
                l_strRequete += "'" + performance.K_temps.ToString() + "',";
                l_strRequete += "'" + performance.K_distance + "',";
                l_strRequete += "'" + ((decimal)performance.K_vitmoy).ToString("0.00").Replace(",",".") + "',";
                l_strRequete += "'" + ((performance.K_vitmax != null) ? performance.K_vitmax.ToString() : "0") + "',";
                l_strRequete += "'" + ((performance.K_comment != null) ? performance.K_comment.Replace("'", "''") : "") + "',"; //Commentaire
                l_strRequete += "'" + ((DateTime)performance.K_date_perf).ToString("yyyy-MM-dd HH:mm:ss") + "',";
                l_strRequete += "'" + performance.K_gps + "',";
                l_strRequete += "'" + performance.K_url + "')";

                DataBase.ExecuteNonQuery(l_strRequete);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static void UpdatePerformance(Performance performance)
        {
            String l_strRequete = "";
            try
            {
                if (performance == null)
                    throw new ArgumentNullException("Performance");
                if (performance.K_primaire == 0)
                    throw new ArgumentNullException("Performance.K_primaire");
                if (performance.K_Key_Sport == null || performance.K_Key_Sport == 0)
                    throw new ArgumentNullException("Sport");
                if (performance.K_Key_Lieu == null || performance.K_Key_Lieu == 0)
                    throw new ArgumentNullException("Lieu");
                if (performance.K_temps == null || performance.K_temps == 0)
                    throw new ArgumentNullException("Temps");
                if (performance.K_distance == null || performance.K_distance == 0)
                    throw new ArgumentNullException("Distance");
                if (performance.K_vitmoy == null || performance.K_vitmoy == 0)
                    throw new ArgumentNullException("Vitesse moyenne");
                if (performance.K_date_perf == null || performance.K_date_perf == DateTime.MinValue)
                    throw new ArgumentNullException("Date");
                if (string.IsNullOrEmpty(performance.K_gps))
                    throw new ArgumentNullException("GPS");

                l_strRequete = "UPDATE KEYMAZE SET ";
                l_strRequete += "K_KEY_SPORT = " + performance.K_Key_Sport + ",";
                l_strRequete += "K_KEY_LIEU = " + performance.K_Key_Lieu + ",";
                l_strRequete += (performance.K_Key_Souslieu != null) ? "K_KEY_SOUSLIEU = " + performance.K_Key_Souslieu + "," : "";
                l_strRequete += (performance.K_Key_Type != null) ? "K_KEY_TYPE = " + performance.K_Key_Type + "," : "";
                l_strRequete += "K_TEMPS = '" + performance.K_temps + "',";
                l_strRequete += "K_DISTANCE = '" + performance.K_distance + "',";
                l_strRequete += "K_VITMOY = '" + ((decimal)performance.K_vitmoy).ToString("0.00").Replace(",", ".") + "',";
                l_strRequete += (performance.K_vitmax != null) ? "K_VITMAX = '" + performance.K_vitmax + "'," : "";
                l_strRequete += (!string.IsNullOrEmpty(performance.K_comment)) ? "K_COMMENT = '" + performance.K_comment.Replace("'", "''") + "'," : "";
                l_strRequete += "K_DATE_PERF = '" + ((DateTime)performance.K_date_perf).ToString("yyyy-MM-dd HH:mm:ss") + "',";
                l_strRequete += "K_GPS = '" + performance.K_gps + "',";
                l_strRequete += "K_URL = '" + performance.K_url + "'";
                l_strRequete += " WHERE K_PRIMAIRE =" + performance.K_primaire;

                DataBase.ExecuteNonQuery(l_strRequete);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static void DeletePerformance(int key)
        {
            try
            {
                if (key <= 0)
                    throw new ArgumentNullException("Clé");

                DataBase.ExecuteNonQuery("DELETE FROM KEYMAZE WHERE K_PRIMAIRE = " + key);
            }
            catch (Exception)
            {
                throw;
            }
        }

    }
}
