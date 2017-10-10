using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KeymazeLocal
{
    public static class DataBase
    {
        private static SQLiteConnection m_objSQLiteConnection;
        private static SQLiteDataReader m_objSQLiteDataReader;

        private static bool m_blnIsConnected;
        public static bool IsInit;

        private static string m_strPath;

        public static void Init(string p_strPath)
        {
            try
            {
                m_strPath = p_strPath;

                IsInit = true;
                m_blnIsConnected = false;
            }
            catch (Exception)
            {
                throw;
            }
        }
        public static void Close()
        {
        }
        public static void Connect()
        {
            try
            {
                if (m_strPath == null)
                {
                    throw new Exception("DataBase : Chaine de connexion non initialisée.");
                }

                if (!m_blnIsConnected)
                {
                    m_objSQLiteConnection = new SQLiteConnection("DataSource=" + m_strPath);
                    m_objSQLiteConnection.Open();
                    m_blnIsConnected = true;
                }

            }
            catch (Exception)
            {
                throw;
            }
        }
        public static void ExecuteReader(string p_strSQLQuery)
        {
            try
            {
                SQLiteCommand l_objSQLiteCommand = new SQLiteCommand(p_strSQLQuery, m_objSQLiteConnection);
                m_objSQLiteDataReader = l_objSQLiteCommand.ExecuteReader();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static T ExecuteScalar<T>(string p_strSQLQuery)
        {
            try
            {
                SQLiteCommand l_objSQLiteCommand = new SQLiteCommand(p_strSQLQuery, m_objSQLiteConnection);
                return (T)l_objSQLiteCommand.ExecuteScalar();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static bool Read()
        {
            try
            {
                bool l_blnIsRead = m_objSQLiteDataReader.Read();
                if (!l_blnIsRead)
                {
                    m_objSQLiteDataReader.Close();
                    return false;
                }
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
        public static bool ExecuteNonQuery(string p_strSQLQuery)
        {
            try
            {
                SQLiteCommand l_objSQLiteCommand = new SQLiteCommand(p_strSQLQuery, m_objSQLiteConnection);
                l_objSQLiteCommand.ExecuteNonQuery();
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
        public static int getInt(int numField)
        {
            return m_objSQLiteDataReader.GetInt32(numField);
        }
        public static double getDouble(int numField)
        {
            if (m_objSQLiteDataReader.IsDBNull(numField))
                return 0d;
            else
                if (m_objSQLiteDataReader.GetValue(numField).ToString() == "0")
                    return 0d;
            return m_objSQLiteDataReader.GetDouble(numField);
        }
        public static decimal getDecimal(int numField)
        {
            return m_objSQLiteDataReader.GetDecimal(numField);
        }
        public static string getString(int numField)
        {
            if (m_objSQLiteDataReader.IsDBNull(numField))
                return "";
            else
                return m_objSQLiteDataReader.GetString(numField);
        }
        public static DateTime getDate(int numField)
        {
            return m_objSQLiteDataReader.GetDateTime(numField);
        }
    }

}
