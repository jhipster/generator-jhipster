package com.mycompany.myapp.web.filter.gzip;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.zip.GZIPOutputStream;

class GZipServletResponseWrapper extends HttpServletResponseWrapper {

    private GZipServletOutputStream gzipOutputStream = null;
    private PrintWriter printWriter = null;
    private boolean disableFlushBuffer = false;

    public GZipServletResponseWrapper(HttpServletResponse response, GZIPOutputStream gzout)
            throws IOException {
        super(response);
        gzipOutputStream = new GZipServletOutputStream(gzout);
    }

    public void close() throws IOException {

        //PrintWriter.close does not throw exceptions. Thus, the call does not need
        //be inside a try-catch block.
        if (this.printWriter != null) {
            this.printWriter.close();
        }

        if (this.gzipOutputStream != null) {
            this.gzipOutputStream.close();
        }
    }

    /**
     * Flush OutputStream or PrintWriter
     *
     * @throws IOException
     */
    @Override
    public void flushBuffer() throws IOException {

        //PrintWriter.flush() does not throw exception
        if (this.printWriter != null) {
            this.printWriter.flush();
        }

        if (this.gzipOutputStream != null) {
            this.gzipOutputStream.flush();
        }

        // doing this might leads to response already committed exception
        // when the PageInfo has not yet built but the buffer already flushed
        // Happens in Weblogic when a servlet forward to a JSP page and the forward
        // method trigger a flush before it forwarded to the JSP
        // disableFlushBuffer for that purpose is 'true' by default
        if (!disableFlushBuffer) {
            super.flushBuffer();
        }
    }

    @Override
    public ServletOutputStream getOutputStream() throws IOException {
        if (this.printWriter != null) {
            throw new IllegalStateException(
                    "PrintWriter obtained already - cannot get OutputStream");
        }

        return this.gzipOutputStream;
    }

    @Override
    public PrintWriter getWriter() throws IOException {
        if (this.printWriter == null) {
            this.gzipOutputStream = new GZipServletOutputStream(
                    getResponse().getOutputStream());

            this.printWriter = new PrintWriter(new OutputStreamWriter(
                    this.gzipOutputStream, getResponse().getCharacterEncoding()), true);
        }

        return this.printWriter;
    }


    @Override
    public void setContentLength(int length) {
        //ignore, since content length of zipped content
        //does not match content length of unzipped content.
    }

    /**
     * Flushes all the streams for this response.
     */
    public void flush() throws IOException {
        if (printWriter != null) {
            printWriter.flush();
        }

        if (gzipOutputStream != null) {
            gzipOutputStream.flush();
        }
    }

    /**
     * Set if the wrapped reponse's buffer flushing should be disabled.
     *
     * @param disableFlushBuffer true if the wrapped reponse's buffer flushing should be disabled
     */
    public void setDisableFlushBuffer(boolean disableFlushBuffer) {
        this.disableFlushBuffer = disableFlushBuffer;
    }
}
