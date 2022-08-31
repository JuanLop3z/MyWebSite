package com.WebSite.Web.Controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UsuarioController {

    public List<String> Index(){

        return List.of("Index","prueba","prueba");
    }
}
